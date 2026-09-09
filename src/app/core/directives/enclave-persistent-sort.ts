import { AfterViewInit, DestroyRef, Directive, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSort, Sort } from '@angular/material/sort';
import { ActivatedRoute, Params, Router } from '@angular/router';

import type { ValuesOf } from '@enclave/core/types/values-of';

const SORT_DIRECTIONS = ['asc', 'desc'] as const;
type SortDirection = ValuesOf<typeof SORT_DIRECTIONS>;
interface PersistedSort {
  column: string;
  direction: SortDirection;
}

@Directive({
  selector: 'table[matSort][enclavePersistentSort]',
})
export class EnclavePersistentSort implements AfterViewInit {
  private readonly sort = inject(MatSort);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public readonly sortableColumns = input.required<string[]>();
  public readonly sortQueryParamName = input<string>('sort');

  ngAfterViewInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const restoredSort = this.parseSortQueryParam();
      if (!restoredSort || this.isSortAlreadyApplied(restoredSort)) {
        return;
      }

      queueMicrotask(() => {
        this.sort.active = restoredSort.column;
        this.sort.direction = restoredSort.direction;
        this.sort.sortChange.emit({
          active: restoredSort.column,
          direction: restoredSort.direction,
        });
      });
    });

    this.sort.sortChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((sort) => {
      this.persistSortInUrl(this.buildSortQueryParam(sort));
    });
  }

  // Breaks the echo loop: our own persistSortInUrl navigation makes queryParamMap
  // re-emit, which would otherwise re-apply and re-emit a sort MatSort already holds,
  // costing a second full table re-render on every header click.
  private isSortAlreadyApplied(restoredSort: PersistedSort): boolean {
    return (
      this.sort.active === restoredSort.column && this.sort.direction === restoredSort.direction
    );
  }

  private persistSortInUrl(param: string | null): void {
    if (this.route.snapshot.queryParamMap.get(this.sortQueryParamName()) === param) {
      return;
    }

    const queryParams: Params = {};
    queryParams[this.sortQueryParamName()] = param;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });
  }

  // e.g. "?sort=name:asc" <-> { column: 'name', direction: 'asc' }
  private parseSortQueryParam(): PersistedSort | undefined {
    const sortParam = this.route.snapshot.queryParamMap.get(this.sortQueryParamName());
    const [rawColumn, rawDirection, ...extra] = sortParam?.split(':') ?? [];
    if (!rawColumn || !rawDirection || extra.length > 0) {
      return undefined;
    }

    const column = this.parseSortColumn(rawColumn.trim().toLowerCase());
    const direction = this.parseSortDirection(rawDirection.trim().toLowerCase());
    return column && direction ? { column, direction } : undefined;
  }

  private parseSortColumn(column: string): string | undefined {
    return this.sortableColumns().find((c) => c === column);
  }

  private parseSortDirection(direction: string): SortDirection | undefined {
    return SORT_DIRECTIONS.find((d) => d === direction);
  }

  private buildSortQueryParam(sort: Sort): string | null {
    return sort.active && sort.direction ? `${sort.active}:${sort.direction}` : null;
  }
}
