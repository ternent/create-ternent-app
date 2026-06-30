export type RuntimeReplayPhase = "system" | "application";

export function createRuntimeReplayContext() {
  let phase: RuntimeReplayPhase = "application";

  return {
    beginSystemPhase() {
      phase = "system";
    },
    beginApplicationPhase() {
      phase = "application";
    },
    isSystemPhase() {
      return phase === "system";
    },
    isApplicationPhase() {
      return phase === "application";
    },
  };
}
