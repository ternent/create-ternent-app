import { useEffect, useState } from "react";
import { createTernentApi } from "./index";

let singleton: ReturnType<typeof createTernentApi> | null = null;

function getApi() {
  singleton ??= createTernentApi();
  return singleton;
}

export function useTernent() {
  const [api, setApi] = useState<ReturnType<typeof createTernentApi> | null>(null);

  useEffect(() => {
    setApi(getApi());
  }, []);

  return api;
}
