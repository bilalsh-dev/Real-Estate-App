"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import type { UserRole } from "@/lib/constants";
import { settingsSchema, type SettingsFormData } from "@/lib/schemas";

const ROLE_TITLE: Record<UserRole, string> = {
  tenant: "Tenant Settings",
  manager: "Manager Settings",
};

type SettingsFormProps = {
  initialData: SettingsFormData;
  onSubmit: (data: SettingsFormData) => Promise<void>;
  userRole: UserRole;
};

export function SettingsForm({ initialData, onSubmit, userRole }: SettingsFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: initialData,
  });

  const toggleEditing = () => {
    if (isEditing) form.reset(initialData);
    setIsEditing(!isEditing);
  };

  const submit = async (data: SettingsFormData) => {
    try {
      await onSubmit(data);
      setIsEditing(false);
    } catch {
      setIsEditing(true);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="mb-5">
        <h1 className="text-xl font-semibold">{ROLE_TITLE[userRole]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences and personal information
        </p>
      </div>
      <div className="rounded-xl bg-white p-6">
        <form onSubmit={form.handleSubmit(submit)} noValidate>
          <FieldGroup>
            <FormField
              control={form.control}
              name="name"
              label="Name"
              autoComplete="name"
              disabled={!isEditing}
            />
            <FormField
              control={form.control}
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              disabled={!isEditing}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              label="Phone Number"
              type="tel"
              autoComplete="tel"
              disabled={!isEditing}
            />
          </FieldGroup>
          <div className="flex justify-between pt-8">
            <Button
              type="button"
              onClick={toggleEditing}
              className="bg-secondary-500 text-white hover:bg-secondary-600"
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            {isEditing && (
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="bg-primary-700 text-white hover:bg-primary-800"
              >
                Save Changes
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
