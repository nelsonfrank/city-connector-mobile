/**
 * Transit entity identifier representing an opaque agency-namespaced ID.
 * Format: {agency_code}:{entity_id} (e.g. 'ncr:1001', 'kbs:stop_42')
 */
export type EntityId = string;

/**
 * Extracts agency code prefix strictly for display badge purposes.
 * Everywhere else in application logic, entity IDs MUST be treated as opaque strings.
 */
export function parseAgencyCode(id: EntityId): string {
  if (!id || typeof id !== 'string') {
    return 'UNKNOWN';
  }
  const separatorIndex = id.indexOf(':');
  if (separatorIndex === -1) {
    return 'DEFAULT';
  }
  const code = id.substring(0, separatorIndex).trim();
  return code ? code.toUpperCase() : 'DEFAULT';
}

/**
 * Validates that an ID conforms to the agency-namespaced contract {agency_code}:{entity_id}.
 */
export function isValidEntityId(id: string): boolean {
  if (typeof id !== 'string') return false;
  const parts = id.split(':');
  return parts.length >= 2 && Boolean(parts[0]?.trim()) && Boolean(parts[1]?.trim());
}
