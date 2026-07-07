import { shallowRef } from "vue";
import { createAppApi } from "../app/api/createAppApi";

const apiState = shallowRef<Awaited<ReturnType<typeof createAppApi>> | null>(null);

export async function useTernent() {
  apiState.value ??= await createAppApi();
  return apiState;
}
