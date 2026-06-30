import type { ConcordReplayPlugin } from "@ternent/concord";
import { createSystemPermissionsPlugin } from "./permissions";
import { createSystemUsersPlugin } from "./users";

export * from "./users";
export * from "./permissions";

export function createSystemPlugins(input: {
  users: boolean;
  permissions: boolean;
}): ConcordReplayPlugin[] {
  const plugins: ConcordReplayPlugin[] = [];

  if (input.users) {
    plugins.push(createSystemUsersPlugin());
  }

  if (input.permissions) {
    plugins.push(createSystemPermissionsPlugin());
  }

  return plugins;
}
