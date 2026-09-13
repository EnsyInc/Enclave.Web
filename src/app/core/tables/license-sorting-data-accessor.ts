import { LicenseStatus } from '@enclave/domain/models';

/**
 * `MatTableDataSource.sortingDataAccessor` for any table row shaped like a license (a `status`
 * and an `end` date, plus whatever else the row carries). Shared by the Licenses list and the
 * Licenses tab on organization/product detail pages, which both render the same columns.
 *
 * `end` and `timeLeft` are derived from the license's actual expiry, so a Scheduled/Suspended/
 * Revoked license (whose expiry date isn't even shown) sorts to the end rather than mixing in
 * arbitrarily by raw date value.
 */
export function licenseSortingDataAccessor<T extends { status: LicenseStatus; end: Date }>(
  row: T,
  columnId: string,
): string | number {
  if (columnId === 'end' && row.status !== 'Active' && row.status !== 'Expired') {
    return Number.POSITIVE_INFINITY;
  }
  if (columnId === 'timeLeft') {
    return row.status === 'Active' ? row.end.getTime() : Number.POSITIVE_INFINITY;
  }

  const val = row[columnId as keyof T];
  if (val instanceof Date) {
    return val.getTime();
  }
  return (val as string | number | undefined) ?? '';
}
