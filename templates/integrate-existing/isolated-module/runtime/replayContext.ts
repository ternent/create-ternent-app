export function createRuntimeReplayContext() {
  let phase: "system" | "application" = "application";

  return {
    beginSystemPhase() {
      phase = "system";
    },
    beginApplicationPhase() {
      phase = "application";
    },
    current() {
      return phase;
    },
  };
}
