import { describe, expect, test } from "bun:test";
import {
  createResetPlan,
  parseConvexComponentNames,
  parseConvexDataTables,
  parseResetDbArgs,
} from "./reset-db";

describe("parseResetDbArgs", () => {
  test("defaults to the dev deployment", () => {
    expect(parseResetDbArgs([])).toEqual({
      deployment: "dev",
      forceProd: false,
    });
  });

  test("accepts a deployment value", () => {
    expect(parseResetDbArgs(["--deployment", "local"])).toEqual({
      deployment: "local",
      forceProd: false,
    });
  });

  test("rejects prod without an explicit force flag", () => {
    expect(() => parseResetDbArgs(["--deployment", "prod"])).toThrow(
      "Refusing to reset production without --force-prod"
    );
  });

  test("allows prod with an explicit force flag", () => {
    expect(parseResetDbArgs(["--deployment", "prod", "--force-prod"])).toEqual({
      deployment: "prod",
      forceProd: true,
    });
  });
});

describe("createResetPlan", () => {
  test("plans dynamically discovered root and component table resets", async () => {
    const plan = await createResetPlan(
      { deployment: "staging", forceProd: false },
      ({ component }) => {
        if (component === "betterAuth") {
          return Promise.resolve(["user", "session"]);
        }

        if (component === "resend") {
          return Promise.resolve(["emails"]);
        }

        return Promise.resolve(["users", "prayers", "newTable"]);
      },
      ["betterAuth", "resend"]
    );

    expect(plan).toEqual([
      {
        component: undefined,
        deployment: "staging",
        table: "users",
      },
      {
        component: undefined,
        deployment: "staging",
        table: "prayers",
      },
      {
        component: undefined,
        deployment: "staging",
        table: "newTable",
      },
      {
        component: "betterAuth",
        deployment: "staging",
        table: "user",
      },
      {
        component: "betterAuth",
        deployment: "staging",
        table: "session",
      },
      {
        component: "resend",
        deployment: "staging",
        table: "emails",
      },
    ]);
  });
});

describe("parseConvexDataTables", () => {
  test("parses table names from Convex data output", () => {
    expect(parseConvexDataTables("users\nprayers\n\nnewTable\n")).toEqual([
      "users",
      "prayers",
      "newTable",
    ]);
  });
});

describe("parseConvexComponentNames", () => {
  test("parses component names from generated Convex API types", () => {
    expect(
      parseConvexComponentNames(`
export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
  futureComponent: import("example/_generated/component.js").ComponentApi<"futureComponent">;
};
`)
    ).toEqual(["betterAuth", "resend", "futureComponent"]);
  });
});
