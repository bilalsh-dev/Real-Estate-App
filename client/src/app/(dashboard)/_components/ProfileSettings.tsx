"use client";

import { SettingsForm } from "@/components/SettingsForm";
import { useAuthUser } from "@/hooks/use-auth-user";
import { UserRole } from "@/lib/constants";
import type { SettingsFormData } from "@/lib/schemas";
import { withToast } from "@/lib/utils";
import { useUpdateManagerSettingsMutation, useUpdateTenantSettingsMutation } from "@/state/api";

export function ProfileSettings({ userRole }: { userRole: UserRole }) {
  const { data: authUser } = useAuthUser();
  const [updateTenant] = useUpdateTenantSettingsMutation();
  const [updateManager] = useUpdateManagerSettingsMutation();

  if (!authUser) return null;

  const { name, email, phoneNumber } = authUser.userInfo;
  const update = userRole === UserRole.Manager ? updateManager : updateTenant;

  const handleSubmit = async (data: SettingsFormData) => {
    await withToast(update({ cognitoId: authUser.cognitoInfo.userId, ...data }).unwrap(), {
      success: "Settings updated",
      error: "Could not update your settings",
    });
  };

  return (
    <SettingsForm
      initialData={{ name, email, phoneNumber }}
      onSubmit={handleSubmit}
      userRole={userRole}
    />
  );
}
