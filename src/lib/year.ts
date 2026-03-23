export const EARLIEST_F1_YEAR = 1950;
export const LATEST_AVAILABLE_F1_YEAR = 2024;

export const DEFAULT_F1_YEAR = LATEST_AVAILABLE_F1_YEAR;

type YearQueryInput = string | string[] | null | undefined;

function asSingleString(value: YearQueryInput) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export function parseYearQuery(value: YearQueryInput) {
  const singleValue = asSingleString(value);

  if (!singleValue || !/^\d{4}$/.test(singleValue)) {
    return null;
  }

  const year = Number(singleValue);

  if (!Number.isInteger(year)) {
    return null;
  }

  if (year < EARLIEST_F1_YEAR || year > LATEST_AVAILABLE_F1_YEAR) {
    return null;
  }

  return year;
}

export function resolveYearQuery(value: YearQueryInput) {
  return parseYearQuery(value) ?? DEFAULT_F1_YEAR;
}

const fixedYearOptions = Array.from(
  { length: LATEST_AVAILABLE_F1_YEAR - EARLIEST_F1_YEAR + 1 },
  (_, index) => LATEST_AVAILABLE_F1_YEAR - index,
);

export function getFixedYearOptions() {
  return fixedYearOptions;
}
