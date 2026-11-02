import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AMENITY_ICONS, HIGHLIGHT_ICONS } from "@/lib/constants";
import { formatEnumString } from "@/lib/utils";
import type { Property } from "@/types";

const TILE_CLASS = "flex flex-col items-center rounded-xl border px-4 py-8";
const GRID_CLASS = "grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

export function PropertyDetails({ property }: { property: Property }) {
  return (
    <div className="mb-6">
      <section>
        <h2 className="my-3 text-xl font-semibold">Property Amenities</h2>
        <ul className={GRID_CLASS}>
          {property.amenities.map((amenity) => {
            const Icon = AMENITY_ICONS[amenity];
            return (
              <li key={amenity} className={TILE_CLASS}>
                <Icon className="mb-2 size-8 text-gray-700" aria-hidden />
                <span className="text-center text-sm text-gray-700">
                  {formatEnumString(amenity)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12 mb-16">
        <h2 className="text-xl font-semibold text-primary-800">Highlights</h2>
        <ul className={`${GRID_CLASS} mt-4 w-full`}>
          {property.highlights.map((highlight) => {
            const Icon = HIGHLIGHT_ICONS[highlight];
            return (
              <li key={highlight} className={TILE_CLASS}>
                <Icon className="mb-2 size-8 text-primary-600" aria-hidden />
                <span className="text-center text-sm text-primary-600">
                  {formatEnumString(highlight)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-5 text-xl font-semibold text-primary-800">Fees and Policies</h2>
        <p className="mt-2 text-sm text-primary-600">
          The fees below are set by the property manager and may exclude utilities.
        </p>
        <Tabs defaultValue="required-fees" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="required-fees">Required Fees</TabsTrigger>
            <TabsTrigger value="pets">Pets</TabsTrigger>
            <TabsTrigger value="parking">Parking</TabsTrigger>
          </TabsList>
          <TabsContent value="required-fees" className="md:w-1/2">
            <p className="mt-5 mb-2 font-semibold">One time move in fees</p>
            <dl className="divide-y border-y">
              <div className="flex justify-between bg-secondary-50 py-2">
                <dt className="font-medium text-primary-700">Application Fee</dt>
                <dd className="text-primary-700">${property.applicationFee}</dd>
              </div>
              <div className="flex justify-between bg-secondary-50 py-2">
                <dt className="font-medium text-primary-700">Security Deposit</dt>
                <dd className="text-primary-700">${property.securityDeposit}</dd>
              </div>
            </dl>
          </TabsContent>
          <TabsContent value="pets">
            <p className="mt-5 mb-2 font-semibold">
              Pets are {property.isPetsAllowed ? "allowed" : "not allowed"}
            </p>
          </TabsContent>
          <TabsContent value="parking">
            <p className="mt-5 mb-2 font-semibold">
              Parking is {property.isParkingIncluded ? "included" : "not included"}
            </p>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
