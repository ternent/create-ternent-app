import { createConcordApp } from "@ternent/concord";
import { createIdentity } from "@ternent/identity";
import { createTasksPlugin, selectTaskById, selectVisibleTasks } from "../plugins/tasks";
import { createIdentitySessionService } from "../runtime/identitySession";
import { createRuntimePrivacyService } from "../runtime/privacy";
import { createRuntimeReplayContext } from "../runtime/replayContext";
import {
  createSystemPlugins,
  selectActiveUser,
  selectPermissionById,
  selectReadablePermissions,
  selectUserByIdentityKey,
} from "../system";
import { ternentEngine } from "../../ternent.config";

export type AppShellStatus = "restoring" | "ready" | "error";

export async function createAppApi() {
  let status: AppShellStatus = "restoring";
  let lastError: string | null = null;
  const identity = await createIdentity();
  const privacy = createRuntimePrivacyService();
  const replayContext = createRuntimeReplayContext();
  const identitySession = createIdentitySessionService({
    identityKey: identity.keyId,
  });
  const app = await createConcordApp({
    identity,
    plugins: [...createSystemPlugins(ternentEngine.systemModules), createTasksPlugin()],
  });

  async function load() {
    status = "restoring";
    lastError = null;

    try {
      await app.load();
      replayContext.beginSystemPhase();
      await app.replay();
      replayContext.beginApplicationPhase();
      await app.replay();
      status = "ready";
    } catch (error) {
      status = "error";
      lastError = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  function getUsersState() {
    return app.getReplayState("system-users") as {
      byId: Record<string, { identityKey: string; label: string | null; createdAt: string }>;
      order: string[];
    };
  }

  function getPermissionsState() {
    return app.getReplayState("system-permissions") as {
      byId: Record<
        string,
        { id: string; title: string; createdAt: string; memberIdentityKeys: string[] }
      >;
      order: string[];
    };
  }

  function getTasksState() {
    return app.getReplayState("tasks") as {
      byId: Record<
        string,
        {
          id: string;
          title: string;
          columnId: string;
          audienceType: "everyone" | "user" | "permission";
          audienceId: string | null;
          createdBy: string;
        }
      >;
      order: string[];
    };
  }

  await load();

  return {
    app,
    replayContext,
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
      ensureUnlocked() {
        return identitySession.ensureUnlocked();
      },
      createOnboardingDraft() {
        return identitySession.createOnboardingDraft();
      },
      completeOnboarding(inputValue: {
        draft: { mnemonicWords: string[]; createdAt: string };
        password: string;
        confirmPassword: string;
        mnemonicConfirmed: boolean;
      }) {
        return identitySession.completeOnboarding(inputValue);
      },
      recoverFromMnemonic(inputValue: {
        mnemonic: string;
        password: string;
        confirmPassword: string;
      }) {
        return identitySession.recoverFromMnemonic(inputValue);
      },
      unlockWithPassword(inputValue: { password: string }) {
        return identitySession.unlockWithPassword(inputValue);
      },
      lock() {
        return identitySession.lock();
      },
    },
    users: {
      all() {
        const state = getUsersState();
        return state.order.map((identityKey) => state.byId[identityKey]).filter(Boolean);
      },
      byIdentityKey(identityKey: string) {
        return selectUserByIdentityKey(getUsersState(), identityKey);
      },
      active() {
        return selectActiveUser(getUsersState(), identitySession.getActiveIdentity()?.identityKey ?? null);
      },
      async create(label: string | null) {
        await app.command("system.user.register", {
          identityKey: crypto.randomUUID(),
          label,
          createdAt: new Date().toISOString(),
        });
      },
    },
    permissions: {
      all() {
        const state = getPermissionsState();
        return state.order.map((permissionId) => state.byId[permissionId]).filter(Boolean);
      },
      byId(permissionId: string) {
        return selectPermissionById(getPermissionsState(), permissionId);
      },
      readableForViewer() {
        return selectReadablePermissions(
          getPermissionsState(),
          identitySession.getActiveIdentity()?.identityKey ?? null,
        );
      },
      async createGroup(title: string) {
        await app.command("system.permission.create", {
          id: crypto.randomUUID(),
          title,
          createdAt: new Date().toISOString(),
          memberIdentityKeys: identitySession.getActiveIdentity()
            ? [identitySession.getActiveIdentity()!.identityKey]
            : [],
        });
      },
      async grant(permissionId: string, identityKey: string) {
        await app.command("system.permission.grant", {
          permissionId,
          identityKey,
        });
      },
      async revoke(permissionId: string, identityKey: string) {
        await app.command("system.permission.revoke", {
          permissionId,
          identityKey,
        });
      },
    },
    privacy: {
      resolveAudience(inputValue: {
        audienceType: "everyone" | "user" | "permission";
        audienceId: string | null;
      }) {
        return privacy.resolveAudience(inputValue, getPermissionsState());
      },
      canWriteAudience(inputValue: {
        audienceType: "everyone" | "user" | "permission";
        audienceId: string | null;
      }) {
        return privacy.canWriteAudience(
          inputValue,
          identitySession.getActiveIdentity()?.identityKey ?? "",
          getPermissionsState(),
        );
      },
      listReadableAudiences() {
        return privacy.listReadableAudiences(
          getPermissionsState(),
          identitySession.getActiveIdentity()?.identityKey ?? null,
        );
      },
    },
    storage: {
      listProviders() {
        return [{ id: "local", label: "Local device", capabilities: { export: true, import: true } }];
      },
      getActiveRef() {
        return { providerId: "local", documentId: ternentEngine.projectId };
      },
      async setActiveRef(ref: { providerId: string; documentId: string }) {
        void ref;
      },
      async configureProvider(inputValue: unknown) {
        void inputValue;
      },
      getCapabilities() {
        return { export: true, import: true };
      },
    },
    tasks: {
      all() {
        const state = getTasksState();
        return state.order.map((taskId) => state.byId[taskId]).filter(Boolean);
      },
      visible() {
        return selectVisibleTasks({
          tasks: getTasksState(),
          permissions: getPermissionsState(),
          viewerIdentityKey: identitySession.getActiveIdentity()?.identityKey ?? null,
        });
      },
      byId(taskId: string) {
        return selectTaskById(getTasksState(), taskId);
      },
      async create(title: string) {
        await app.command("task.create", {
          id: crypto.randomUUID(),
          title,
          columnId: "todo",
          audienceType: "everyone",
          audienceId: null,
          createdBy: identity.keyId,
        });
      },
      async move(taskId: string, columnId: string) {
        await app.command("task.move", {
          taskId,
          columnId,
        });
      },
      async rename(taskId: string, title: string) {
        await app.command("task.rename", {
          taskId,
          title,
        });
      },
    },
    async load() {
      await load();
    },
    async command<TInput = unknown>(type: string, input: TInput) {
      return await app.command(type, input);
    },
    async commit(inputValue?: unknown) {
      return await app.commit(inputValue);
    },
    async discard() {
      await app.discard();
    },
    async replay(optionsValue?: unknown) {
      if (optionsValue) {
        await app.replay(optionsValue);
        return;
      }
      await app.replay();
    },
    async exportLedger() {
      return await app.exportLedger();
    },
    async importLedger(container: unknown) {
      await app.importLedger(container);
      await load();
    },
    getState() {
      return app.getState();
    },
    subscribe(listener: (state: unknown) => void) {
      return app.subscribe(listener);
    },
  };
}
