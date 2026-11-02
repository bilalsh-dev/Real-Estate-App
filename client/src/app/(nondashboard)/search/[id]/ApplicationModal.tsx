"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import {
  applicationSchema,
  type ApplicationFormData,
  type ApplicationFormInput,
} from "@/lib/schemas";
import { apiErrorMessage } from "@/lib/utils";
import { useCreateApplicationMutation } from "@/state/api";
import type { Tenant } from "@/types";

type ApplicationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: number;
  tenant: Pick<Tenant, "name" | "email" | "phoneNumber">;
};

export function ApplicationModal({
  open,
  onOpenChange,
  propertyId,
  tenant,
}: ApplicationModalProps) {
  const [createApplication, { isLoading }] = useCreateApplicationMutation();
  const form = useForm<ApplicationFormInput, unknown, ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: tenant.name,
      email: tenant.email,
      phoneNumber: tenant.phoneNumber,
      message: "",
    },
  });
  const { control } = form;

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      await createApplication({ propertyId, ...data }).unwrap();
      toast.success("Application submitted");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not submit the application"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Submit Application for this Property</DialogTitle>
          <DialogDescription>
            The property manager will contact you with a decision.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <FormField control={control} name="name" label="Name" autoComplete="name" />
            <FormField
              control={control}
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
            />
            <FormField
              control={control}
              name="phoneNumber"
              label="Phone Number"
              type="tel"
              autoComplete="tel"
            />
            <FormField
              control={control}
              name="message"
              label="Message (Optional)"
              placeholder="Anything the manager should know"
              multiline
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-700 text-white hover:bg-primary-600"
            >
              Submit Application
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
