import { shallowRef } from "vue";
import { createTernentApi } from "./index";

const apiState = shallowRef<ReturnType<typeof createTernentApi> | null>(null);

export function useTernent() {
  apiState.value ??= createTernentApi();
  return apiState;
}
