import type { ProfileInput } from "../schemas/profile.ts";

export type ProfileService<TProfile> = {
  get(cognitoId: string): Promise<TProfile>;
  create(cognitoId: string, input: ProfileInput): Promise<TProfile>;
  update(cognitoId: string, input: ProfileInput): Promise<TProfile>;
};
