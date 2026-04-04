import inquirer from "inquirer";
import validateNpmPackageName from "validate-npm-package-name";

type DbChoice = "postgres" | "mysql";

type CliOptions = {
  projectName: string;
  db: DbChoice;
  docker: boolean;
  skipInstall: boolean;
};

function validateProjectName(name: string): true | string {
  if (!name || typeof name !== "string") return "Project name is required";
  if (name.trim() !== name) return "Project name cannot start/end with spaces";

  const result = validateNpmPackageName(name);
  if (result.validForNewPackages) return true;

  const errors = [
    ...(result.errors ?? []),
    ...(result.warnings ?? []).map((w: string) => `Warning: ${w}`),
  ];

  return errors.length ? errors.join(". ") : "Invalid project name";
}

export async function promptForMissingOptions(
  partial: Partial<CliOptions>,
): Promise<CliOptions> {
  const questions: Array<Record<string, unknown>> = [];

  if (!partial.projectName) {
    questions.push({
      type: "input",
      name: "projectName",
      message: "Project name:",
      validate: validateProjectName,
    });
  } else {
    const validity = validateProjectName(partial.projectName);
    if (validity !== true) {
      questions.push({
        type: "input",
        name: "projectName",
        message: "Project name:",
        default: partial.projectName,
        validate: validateProjectName,
      });
    }
  }

  if (!partial.db) {
    questions.push({
      type: "list",
      name: "db",
      message: "Database:",
      choices: [
        { name: "Postgres", value: "postgres" },
        { name: "MySQL", value: "mysql" },
      ],
      default: "postgres",
    });
  }

  if (partial.docker === undefined) {
    questions.push({
      type: "confirm",
      name: "docker",
      message: "Include Docker files?",
      default: true,
    });
  }

  const answers: Partial<CliOptions> = questions.length
    ? await inquirer.prompt<Partial<CliOptions>>(questions as never)
    : {};

  const projectName = (answers.projectName ?? partial.projectName) as string;
  const db = (answers.db ?? partial.db ?? "postgres") as DbChoice;
  const docker = (answers.docker ?? partial.docker ?? true) as boolean;

  return {
    projectName,
    db,
    docker,
    skipInstall: Boolean(partial.skipInstall),
  };
}
