import { createAppApi } from "../app/api/createAppApi";

let singleton: Awaited<ReturnType<typeof createAppApi>> | null = null;

export async function useTernent() {
  singleton ??= await createAppApi();
  return singleton;
}
