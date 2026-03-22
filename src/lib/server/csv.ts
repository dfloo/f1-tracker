import { readFileSync } from 'node:fs';
import path from 'node:path';

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

export function parseCsvFile(fileName: string) {
  const filePath = path.join(process.cwd(), 'temp-data', fileName);
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter((line) => line.length > 0);

  const [headerLine, ...rowLines] = lines;

  if (!headerLine) {
    return [] as Array<Record<string, string>>;
  }

  const headers = parseCsvLine(headerLine);

  return rowLines.map((line) => {
    const rowValues = parseCsvLine(line);
    const row: Record<string, string> = {};

    for (let index = 0; index < headers.length; index += 1) {
      row[headers[index]] = rowValues[index] ?? '';
    }

    return row;
  });
}

export function toNullableString(value: string) {
  if (!value || value === '\\N') {
    return null;
  }

  return value;
}

export function toNullableNumber(value: string) {
  const normalized = toNullableString(value);

  if (normalized === null) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
