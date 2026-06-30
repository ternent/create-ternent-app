import { describe, expect, it, vi } from "vitest";
import { createClackPromptDriver } from "../src/cli/clack-driver.js";

describe("Module 1 Clack prompt driver", () => {
  it("delegates select prompts to Clack with routed options", async () => {
    const select = vi.fn(async () => "core-only") as unknown as Parameters<
      typeof createClackPromptDriver
    >[0]["select"];
    const driver = createClackPromptDriver({
      text: vi.fn(),
      select,
      multiselect: vi.fn(),
    });

    const result = await driver.select({
      name: "tier",
      message: "Select Core Layer Profile",
      options: [
        {
          label: "Core Only",
          value: "core-only",
          hint: "Cryptographic runtimes and definitions only",
        },
      ],
    });

    expect(result).toBe("core-only");
    expect(select).toHaveBeenCalledWith({
      message: "Select Core Layer Profile",
      options: [
        {
          label: "Core Only",
          value: "core-only",
          hint: "Cryptographic runtimes and definitions only",
        },
      ],
    });
  });

  it("forwards multiselect initialValues to Clack", async () => {
    const multiselect = vi.fn(async () => ["system-users", "snapshot-engine"]) as unknown as Parameters<
      typeof createClackPromptDriver
    >[0]["multiselect"];
    const driver = createClackPromptDriver({
      text: vi.fn(),
      select: vi.fn(),
      multiselect,
    });

    const result = await driver.multiselect({
      name: "features",
      message: "Select Default Core Components",
      options: [
        {
          label: "System Users & Identity",
          value: "system-users",
          hint: "Native identity and users system module",
        },
        {
          label: "Snapshot Engine & Local Ledger Cache",
          value: "snapshot-engine",
          hint: "Replay acceleration and local persistence",
        },
      ],
      initialValues: ["system-users", "snapshot-engine"],
    });

    expect(result).toEqual(["system-users", "snapshot-engine"]);
    expect(multiselect).toHaveBeenCalledWith({
      message: "Select Default Core Components",
      options: [
        {
          label: "System Users & Identity",
          value: "system-users",
          hint: "Native identity and users system module",
        },
        {
          label: "Snapshot Engine & Local Ledger Cache",
          value: "snapshot-engine",
          hint: "Replay acceleration and local persistence",
        },
      ],
      initialValues: ["system-users", "snapshot-engine"],
    });
  });
});
