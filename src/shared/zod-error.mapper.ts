import { ZodError } from 'zod/v4';

export interface ParsedZodErrors {
  fieldErrors: Record<string, string[]>;
  formErrors: string[];
}

export function mapZodErrorToFieldAndFormErrors(
  zodError?: ZodError,
): ParsedZodErrors {
  if (!zodError) {
    return {
      fieldErrors: {},
      formErrors: [],
    };
  }

  const fieldErrors: Record<string, string[]> = {};
  const formErrors: string[] = [];

  for (const issue of zodError.issues) {
    const sanitizedPath = sanitizePath(issue.path);
    if (sanitizedPath.length === 0) {
      if (!formErrors.includes(issue.message)) {
        formErrors.push(issue.message);
      }
      continue;
    }

    const path = toFieldErrorPath(sanitizedPath);
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }

    if (!fieldErrors[path].includes(issue.message)) {
      fieldErrors[path].push(issue.message);
    }
  }

  return {
    fieldErrors,
    formErrors,
  };
}

function sanitizePath(path: readonly PropertyKey[]): Array<string | number> {
  return path.filter(
    (segment): segment is string | number =>
      typeof segment === 'string' || typeof segment === 'number',
  );
}

function toFieldErrorPath(path: readonly (string | number)[]): string {
  return path
    .map((segment, index) => {
      if (typeof segment === 'number') {
        return `[${segment}]`;
      }

      return index === 0 ? segment : `.${segment}`;
    })
    .join('');
}
