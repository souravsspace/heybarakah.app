import { $, argv, file, write } from "bun";

type ResetComponent = string;

interface ResetDbArgs {
  deployment: string;
  forceProd: boolean;
}

interface ResetStep {
  component?: ResetComponent;
  deployment: string;
  table: string;
}

interface ListTablesOptions {
  component?: ResetComponent;
  deployment: string;
}

type ListTables = (options: ListTablesOptions) => Promise<string[]>;

const EMPTY_JSONL_PATH = ".convex-reset-empty.jsonl";
const GENERATED_API_PATH = new URL(
  "../convex/_generated/api.d.ts",
  import.meta.url
);
const COMPONENTS_BLOCK_REGEX =
  /export declare const components: \{(?<body>[\s\S]*?)\};/;
const COMPONENT_NAME_REGEX = /^\s*(?<name>[A-Za-z_$][\w$]*):\s*import\(/;

function isProductionDeployment(deployment: string) {
  return deployment === "prod" || deployment.endsWith(":prod");
}

function usage() {
  return [
    "Reset Convex tables by replacing each table with an empty JSONL file.",
    "",
    "Usage:",
    "  bun reset:db",
    "  bun reset:db -- --deployment local",
    "  bun reset:db -- --deployment staging",
    "  bun reset:db -- --deployment prod --force-prod",
    "",
    "Options:",
    "  --deployment <value>  Convex deployment reference. Defaults to dev.",
    "  --force-prod          Allow resetting prod. Required for prod.",
    "  --help                Show this help message.",
  ].join("\n");
}

export function parseResetDbArgs(argv: string[]): ResetDbArgs {
  let deployment = "dev";
  let forceProd = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      throw new Error(usage());
    }

    if (arg === "--force-prod") {
      forceProd = true;
      continue;
    }

    if (arg === "--deployment") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --deployment");
      }
      deployment = value;
      index += 1;
      continue;
    }

    if (arg?.startsWith("--deployment=")) {
      const value = arg.slice("--deployment=".length);
      if (!value) {
        throw new Error("Missing value for --deployment");
      }
      deployment = value;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (isProductionDeployment(deployment) && !forceProd) {
    throw new Error("Refusing to reset production without --force-prod");
  }

  return { deployment, forceProd };
}

export function parseConvexDataTables(output: string): string[] {
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseConvexComponentNames(apiTypes: string): string[] {
  const componentBlock = apiTypes.match(COMPONENTS_BLOCK_REGEX)?.groups?.body;

  if (!componentBlock) {
    return [];
  }

  return componentBlock
    .split("\n")
    .map((line) => line.match(COMPONENT_NAME_REGEX)?.groups?.name)
    .filter((name): name is string => Boolean(name));
}

async function listComponents() {
  return parseConvexComponentNames(await file(GENERATED_API_PATH).text());
}

async function listTables(options: ListTablesOptions) {
  if (options.component) {
    const output =
      await $`bun convex data --deployment ${options.deployment} --component ${options.component}`.text();
    return parseConvexDataTables(output);
  }

  const output =
    await $`bun convex data --deployment ${options.deployment}`.text();
  return parseConvexDataTables(output);
}

export async function createResetPlan(
  args: ResetDbArgs,
  listTablesForScope: ListTables = listTables,
  components?: string[]
): Promise<ResetStep[]> {
  const rootTables = await listTablesForScope({ deployment: args.deployment });
  const rootSteps = rootTables.map((table) => ({
    component: undefined,
    deployment: args.deployment,
    table,
  }));

  const componentSteps: ResetStep[] = [];
  const componentNames = components ?? (await listComponents());

  for (const component of componentNames) {
    const componentTables = await listTablesForScope({
      component,
      deployment: args.deployment,
    });

    componentSteps.push(
      ...componentTables.map((table) => ({
        component,
        deployment: args.deployment,
        table,
      }))
    );
  }

  return [...rootSteps, ...componentSteps];
}

async function resetTable(step: ResetStep) {
  if (step.component) {
    await $`bun convex import --replace --yes --deployment ${step.deployment} --component ${step.component} --table ${step.table} ${EMPTY_JSONL_PATH}`;
    return;
  }

  await $`bun convex import --replace --yes --deployment ${step.deployment} --table ${step.table} ${EMPTY_JSONL_PATH}`;
}

async function main(argv: string[]) {
  const args = parseResetDbArgs(argv);
  const plan = await createResetPlan(args);

  await write(EMPTY_JSONL_PATH, "");

  for (const step of plan) {
    const scope = step.component
      ? `${step.component}/${step.table}`
      : step.table;
    console.log(`Resetting ${scope} on ${step.deployment}...`);
    await resetTable(step);
  }

  console.log(`Reset ${plan.length} Convex tables on ${args.deployment}.`);
}

if (import.meta.main) {
  try {
    await main(argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
