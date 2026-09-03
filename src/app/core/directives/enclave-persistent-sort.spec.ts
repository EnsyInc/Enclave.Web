import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSort, MatSortHeader, MatSortModule } from '@angular/material/sort';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { vi } from 'vitest';

import { EnclavePersistentSort } from './enclave-persistent-sort';

@Component({
  imports: [EnclavePersistentSort, MatSortModule],
  template: `
    <table
      matSort
      enclavePersistentSort
      [sortableColumns]="sortableColumns"
      [sortQueryParamName]="sortQueryParamName"
    >
      <tr>
        <th mat-sort-header="name">Name</th>
        <th mat-sort-header="status">Status</th>
      </tr>
    </table>
  `,
})
class HostComponent {
  sortableColumns: string[] = ['name', 'status'];
  sortQueryParamName = 'sort';
}

interface FixtureOptions {
  queryParams?: Record<string, string>;
  sortableColumns?: string[];
  sortQueryParamName?: string;
}

function createFixture(options: FixtureOptions = {}): {
  fixture: ComponentFixture<HostComponent>;
  navigate: ReturnType<typeof vi.fn>;
  sort: MatSort;
} {
  const navigate = vi.fn().mockResolvedValue(true);

  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [
      { provide: Router, useValue: { navigate } },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: convertToParamMap(options.queryParams ?? {}) } },
      },
    ],
  });

  const fixture = TestBed.createComponent(HostComponent);
  if (options.sortableColumns) {
    fixture.componentInstance.sortableColumns = options.sortableColumns;
  }
  if (options.sortQueryParamName) {
    fixture.componentInstance.sortQueryParamName = options.sortQueryParamName;
  }

  const sort = fixture.debugElement.query(By.directive(MatSort)).injector.get(MatSort);

  return { fixture, navigate, sort };
}

describe('EnclavePersistentSort', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('restores ascending sort from the query param on init', async () => {
    const { fixture, sort } = createFixture({ queryParams: { sort: 'name:asc' } });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sort.active).toBe('name');
    expect(sort.direction).toBe('asc');
  });

  it('restores descending sort from the query param on init', async () => {
    const { fixture, sort } = createFixture({ queryParams: { sort: 'status:desc' } });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sort.active).toBe('status');
    expect(sort.direction).toBe('desc');
  });

  it.each([
    ['missing the direction half', 'name'],
    ['naming a non-sortable column', 'description:asc'],
    ['using an unrecognized direction', 'name:sideways'],
    ['with trailing garbage', 'name:asc:extra'],
  ])('ignores a malformed sort query param (%s)', async (_label, sortParam) => {
    const { fixture, sort } = createFixture({ queryParams: { sort: sortParam } });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sort.active).toBeFalsy();
  });

  it('navigates with the sort query param set once the debounce elapses after a header click', () => {
    vi.useFakeTimers();
    const { fixture, navigate } = createFixture();
    fixture.detectChanges();

    const nameSortHeader = fixture.debugElement.queryAll(By.directive(MatSortHeader))[0];
    nameSortHeader.triggerEventHandler('click', null);

    vi.advanceTimersByTime(400);

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { sort: 'name:asc' },
      queryParamsHandling: 'merge',
    });
  });

  it('collapses rapid header clicks into a single navigation with the final sort state', () => {
    vi.useFakeTimers();
    const { fixture, navigate } = createFixture();
    fixture.detectChanges();

    const nameSortHeader = fixture.debugElement.queryAll(By.directive(MatSortHeader))[0];
    // Cycles asc -> desc -> none (disableClear defaults to false), all within the debounce window.
    nameSortHeader.triggerEventHandler('click', null);
    nameSortHeader.triggerEventHandler('click', null);
    nameSortHeader.triggerEventHandler('click', null);

    vi.advanceTimersByTime(400);

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { sort: null },
      queryParamsHandling: 'merge',
    });
  });

  it('restores sort from a custom query param name instead of "sort"', async () => {
    const { fixture, sort } = createFixture({
      queryParams: { productsSort: 'status:desc' },
      sortQueryParamName: 'productsSort',
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sort.active).toBe('status');
    expect(sort.direction).toBe('desc');
  });

  it('ignores the default "sort" param when a custom sortQueryParamName is set', async () => {
    const { fixture, sort } = createFixture({
      queryParams: { sort: 'name:asc' },
      sortQueryParamName: 'productsSort',
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sort.active).toBeFalsy();
  });

  it('writes to a custom query param name instead of "sort"', () => {
    vi.useFakeTimers();
    const { fixture, navigate } = createFixture({ sortQueryParamName: 'productsSort' });
    fixture.detectChanges();

    const nameSortHeader = fixture.debugElement.queryAll(By.directive(MatSortHeader))[0];
    nameSortHeader.triggerEventHandler('click', null);

    vi.advanceTimersByTime(400);

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { productsSort: 'name:asc' },
      queryParamsHandling: 'merge',
    });
  });
});
