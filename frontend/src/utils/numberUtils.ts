export function parseFlexibleNumber(raw: string): number | undefined {
  const normalized = (raw || '').trim().replace(',', '.');
  const match = normalized.match(/\d+(\.\d+)?/);
  if (!match) return undefined;
  const parsed = Number(match[0]);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

export function parsePositiveInt(raw: string, fallback?: number): number | undefined {
  const parsed = parseFlexibleNumber(raw);
  if (parsed === undefined) return fallback;
  const rounded = Math.round(parsed);
  if (!Number.isFinite(rounded) || rounded <= 0) return fallback;
  return rounded;
}

export function parsePositiveFloat(raw: string, fallback?: number): number | undefined {
  const parsed = parseFlexibleNumber(raw);
  if (parsed === undefined) return fallback;
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}
