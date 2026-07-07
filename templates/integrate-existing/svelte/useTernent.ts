import { createTernentApi } from "./index";

let singleton: ReturnType<typeof createTernentApi> | null = null;

export function useTernent() {
  singleton ??= createTernentApi();
  return singleton;
}
