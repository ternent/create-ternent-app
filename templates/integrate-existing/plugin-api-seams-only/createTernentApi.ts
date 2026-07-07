import { createIdentitySessionService } from "./identitySession";
import { createRuntimePrivacyService } from "./privacy";
import { createRuntimeReplayContext } from "./replayContext";
import {
  createPermissionsState,
  selectPermissionById,
  selectReadablePermissions,
} from "./system/permissions";
import { createUsersState, selectActiveUser, selectUserByIdentityKey } from "./system/users";
import { createTasksState, selectVisibleTasks } from "./plugins/tasks";

export function createTernentApi() {
  const identitySession = createIdentitySessionService();
  const replayContext = createRuntimeReplayContext();
  const privacy = createRuntimePrivacyService();
  const users = createUsersState();
  const permissions = createPermissionsState();
  const tasks = createTasksState();
  let status: "restoring" | "ready" | "error" = "ready";
  let lastError: string | null = null;

  return {
    status: {
      current() {
        return status;
      },
    },
    lastError: {
      current() {
        return lastError;
      },
    },
    identity: {
      status() {
        return identitySession.status();
      },
      getActiveIdentity() {
        return identitySession.getActiveIdentity();
      },
      createOnboardingDraft() {
        return identitySession.createOnboardingDraft();
      },
      completeOnboarding(input: {
        draft: { mnemonicWords: string[]; createdAt: string };
        password: string;
        confirmPassword: string;
        mnemonicConfirmed: boolean;
      }) {
        return identitySession.completeOnboarding(input);
      },
      recoverFromMnemonic(input: {
        mnemonic: string;
        password: string;
        confirmPassword: string;
      }) {
        return identitySession.recoverFromMnemonic(input);
      },
      unlockWithPassword(input: { password: string }) {
        return identitySession.unlockWithPassword(input);
      },
      ensureUnlocked() {
        return identitySession.ensureUnlocked();
      },
      lock() {
        return identitySession.lock();
      },
    },
    users: {
      all() {
        return users.order.map((identityKey) => users.byId[identityKey]).filter(Boolean);
      },
      byIdentityKey(identityKey: string) {
        return selectUserByIdentityKey(users, identityKey);
      },
      active() {
        return selectActiveUser(users, identitySession.getActiveIdentity()?.identityKey ?? null);
      },
    },
    permissions: {
      all() {
        return permissions.order.map((permissionId) => permissions.byId[permissionId]).filter(Boolean);
      },
      byId(permissionId: string) {
        return selectPermissionById(permissions, permissionId);
      },
      readableForViewer() {
        return selectReadablePermissions(
          permissions,
          identitySession.getActiveIdentity()?.identityKey ?? null,
        );
      },
    },
    privacy: {
      resolveAudience(input: {
        audienceType: "everyone" | "user" | "permission";
        audienceId: string | null;
      }) {
        return privacy.resolveAudience(input, permissions);
      },
      canWriteAudience(input: {
        audienceType: "everyone" | "user" | "permission";
        audienceId: string | null;
      }) {
        return privacy.canWriteAudience(
          input,
          identitySession.getActiveIdentity()?.identityKey ?? "",
          permissions,
        );
      },
      listReadableAudiences() {
        return privacy.listReadableAudiences(
          permissions,
          identitySession.getActiveIdentity()?.identityKey ?? null,
        );
      },
    },
    tasks: {
      all() {
        return tasks.order.map((taskId) => tasks.byId[taskId]).filter(Boolean);
      },
      visible() {
        return selectVisibleTasks({
          tasks,
          permissions,
          viewerIdentityKey: identitySession.getActiveIdentity()?.identityKey ?? null,
        });
      },
    },
    storage: {
      listProviders() {
        return [{ id: "local", label: "Local device" }];
      },
    },
    replay() {
      replayContext.beginApplicationPhase();
      status = "ready";
    },
    commit() {
      status = "ready";
    },
    subscribe(listener: (state: { users: typeof users; permissions: typeof permissions; tasks: typeof tasks }) => void) {
      listener({ users, permissions, tasks });
      return () => undefined;
    },
    getState() {
      return { users, permissions, tasks, phase: replayContext.current() };
    },
    setError(message: string | null) {
      lastError = message;
      status = message ? "error" : "ready";
    },
  };
}
