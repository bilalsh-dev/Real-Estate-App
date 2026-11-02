import { LEASE_TERM_YEARS, Role } from "../config/constants.ts";
import { ApplicationStatus } from "../generated/prisma/enums.ts";
import type {
  Application,
  Lease,
  Location,
  Manager,
  PrismaClient,
  Property,
  Tenant,
} from "../generated/prisma/client.ts";
import { addYears, nextMonthlyDate } from "../lib/dates.ts";
import { ConflictError, ForbiddenError, NotFoundError } from "../lib/errors.ts";
import type { AuthUser } from "../middleware/auth.ts";
import type { CreateApplicationInput, ReviewDecision } from "../schemas/application.ts";

export type ApplicationListItem = Application & {
  property: Property & { location: Location; manager: Manager };
  tenant: Tenant;
  manager: Manager;
  lease: (Lease & { nextPaymentDate: Date | null }) | null;
};

export type ApplicationDetail = Application & {
  property: Property;
  tenant: Tenant;
  lease: Lease | null;
};

export type ApplicationService = {
  listForUser(user: AuthUser): Promise<ApplicationListItem[]>;
  create(tenantCognitoId: string, input: CreateApplicationInput): Promise<ApplicationDetail>;
  review(
    applicationId: number,
    managerCognitoId: string,
    decision: ReviewDecision,
  ): Promise<ApplicationDetail>;
};

const ALREADY_REVIEWED = "This application has already been reviewed";

export function createApplicationService(
  db: PrismaClient,
  now: () => Date = () => new Date(),
): ApplicationService {
  return {
    async listForUser(user) {
      const applications = await db.application.findMany({
        where:
          user.role === Role.Tenant
            ? { tenantCognitoId: user.id }
            : { property: { managerCognitoId: user.id } },
        include: {
          property: { include: { location: true, manager: true } },
          tenant: true,
          lease: true,
        },
        orderBy: { applicationDate: "desc" },
      });

      const today = now();
      return applications.map((application) => ({
        ...application,
        manager: application.property.manager,
        lease: application.lease && {
          ...application.lease,
          nextPaymentDate:
            application.lease.endDate > today
              ? nextMonthlyDate(application.lease.startDate, today)
              : null,
        },
      }));
    },

    async create(tenantCognitoId, { propertyId, message, ...contact }) {
      const property = await db.property.findUnique({
        where: { id: propertyId },
        select: { id: true },
      });
      if (!property) throw new NotFoundError("Property not found");

      const pending = await db.application.findFirst({
        where: { propertyId, tenantCognitoId, status: ApplicationStatus.Pending },
        select: { id: true },
      });
      if (pending)
        throw new ConflictError("You already have a pending application for this property");

      return db.application.create({
        data: {
          ...contact,
          message: message ?? null,
          applicationDate: now(),
          status: ApplicationStatus.Pending,
          propertyId,
          tenantCognitoId,
        },
        include: { property: true, tenant: true, lease: true },
      });
    },

    async review(applicationId, managerCognitoId, decision) {
      const application = await db.application.findUnique({
        where: { id: applicationId },
        include: {
          property: {
            select: { managerCognitoId: true, pricePerMonth: true, securityDeposit: true },
          },
        },
      });
      if (!application) throw new NotFoundError("Application not found");
      if (application.property.managerCognitoId !== managerCognitoId) {
        throw new ForbiddenError("You can only review applications for your own properties");
      }
      if (application.status !== ApplicationStatus.Pending)
        throw new ConflictError(ALREADY_REVIEWED);

      return db.$transaction(async (tx) => {
        const { count } = await tx.application.updateMany({
          where: { id: applicationId, status: ApplicationStatus.Pending },
          data: { status: decision },
        });
        if (count === 0) throw new ConflictError(ALREADY_REVIEWED);

        if (decision === ApplicationStatus.Approved) {
          const startDate = now();
          const lease = await tx.lease.create({
            data: {
              startDate,
              endDate: addYears(startDate, LEASE_TERM_YEARS),
              rent: application.property.pricePerMonth,
              deposit: application.property.securityDeposit,
              propertyId: application.propertyId,
              tenantCognitoId: application.tenantCognitoId,
            },
          });
          await tx.application.update({
            where: { id: applicationId },
            data: { leaseId: lease.id },
          });
          await tx.property.update({
            where: { id: application.propertyId },
            data: { tenants: { connect: { cognitoId: application.tenantCognitoId } } },
          });
        }

        return tx.application.findUniqueOrThrow({
          where: { id: applicationId },
          include: { property: true, tenant: true, lease: true },
        });
      });
    },
  };
}
