import { useEffect, useState } from "react";
import { createAppApi } from "../app/api/createAppApi";

let singletonPromise: ReturnType<typeof createAppApi> | null = null;

function getAppApi() {
  singletonPromise ??= createAppApi();
  return singletonPromise;
}

export function useTernent() {
  const [api, setApi] = useState<Awaited<ReturnType<typeof createAppApi>> | null>(null);

  useEffect(() => {
    void getAppApi().then(setApi);
  }, []);

  return api;
}
