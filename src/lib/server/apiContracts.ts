export const API_SCHEMA_NAME = 'f1-tracker';
export const API_SCHEMA_REVISION = '2026-03-22';

export type ApiMeta = {
  schema: string;
  schemaRevision: string;
  generatedAt: string;
};

export type ApiSuccess<T> = {
  meta: ApiMeta;
  data: T;
};

export type ApiFailure = {
  meta: ApiMeta;
  error: {
    code: string;
    message: string;
  };
};

export function createMeta(): ApiMeta {
  return {
    schema: API_SCHEMA_NAME,
    schemaRevision: API_SCHEMA_REVISION,
    generatedAt: new Date().toISOString(),
  };
}

export function success<T>(data: T): ApiSuccess<T> {
  return {
    meta: createMeta(),
    data,
  };
}

export function failure(code: string, message: string): ApiFailure {
  return {
    meta: createMeta(),
    error: {
      code,
      message,
    },
  };
}
