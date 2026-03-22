import { NextResponse } from 'next/server';

import { failure, success } from '@/lib/server/apiContracts';

export function parseIntegerQuery(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    return null;
  }

  return parsed;
}

export function okJson<T>(data: T, status = 200) {
  return NextResponse.json(success(data), { status });
}

export function errorJson(params: {
  code: string;
  message: string;
  status: number;
}) {
  return NextResponse.json(
    failure(params.code, params.message),
    { status: params.status },
  );
}
