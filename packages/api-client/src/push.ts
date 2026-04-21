import type { PushRegisterInput } from "@vuelvecasa/shared";
import type { ApiClient } from "./client";

export function makePushApi(c: ApiClient) {
  return {
    registerToken(input: PushRegisterInput): Promise<{ saved: boolean }> {
      return c.request("/api/v1/push/register-token", {
        method: "POST",
        body: input,
      });
    },
    unregisterToken(token: string): Promise<{ deleted: boolean }> {
      return c.request(`/api/v1/push/register-token`, {
        method: "DELETE",
        search: { token },
      });
    },
  };
}
