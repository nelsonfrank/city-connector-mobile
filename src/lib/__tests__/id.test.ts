import { isValidEntityId, parseAgencyCode } from '../id';

describe('ID Helpers (Agency-namespaced strings)', () => {
  it('correctly extracts uppercase agency code for display badge only', () => {
    expect(parseAgencyCode('ncr:1001')).toBe('NCR');
    expect(parseAgencyCode('kbs:stop_42')).toBe('KBS');
    expect(parseAgencyCode('supermetro:sm_101')).toBe('SUPERMETRO');
  });

  it('handles edge cases gracefully without throwing', () => {
    expect(parseAgencyCode('')).toBe('UNKNOWN');
    expect(parseAgencyCode('nostopid')).toBe('DEFAULT');
    expect(parseAgencyCode(':123')).toBe('DEFAULT');
  });

  it('validates entity ID namespacing format', () => {
    expect(isValidEntityId('kbs:101')).toBe(true);
    expect(isValidEntityId('matatu:trip_99')).toBe(true);
    expect(isValidEntityId('invalid')).toBe(false);
    expect(isValidEntityId(':')).toBe(false);
  });
});
