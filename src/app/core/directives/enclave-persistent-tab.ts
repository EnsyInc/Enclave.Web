import {
  AfterViewInit,
  contentChildren,
  DestroyRef,
  Directive,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { debounceTime } from 'rxjs';

@Directive({
  selector: 'mat-tab-group[enclavePersistentTab]',
})
export class EnclavePersistentTab implements AfterViewInit {
  private readonly tabGroup = inject(MatTabGroup);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tabs = contentChildren(MatTab);

  public readonly tabQueryParamName = input<string>('tab');

  ngAfterViewInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const restoredIndex = this.parseTabQueryParam();
      if (restoredIndex !== undefined && restoredIndex !== this.tabGroup.selectedIndex) {
        queueMicrotask(() => {
          this.tabGroup.selectedIndex = restoredIndex;
        });
      } else {
        const currentIndex = this.tabGroup.selectedIndex ?? 0;
        const currentLabel = this.tabs()[currentIndex]?.textLabel.toLowerCase();

        if (currentLabel) {
          this.persistTabInUrl(currentLabel, true);
        }
      }
    });

    this.tabGroup.selectedTabChange
      .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => {
        this.persistTabInUrl(e.tab.textLabel.toLowerCase());
      });
  }

  private parseTabQueryParam(): number | undefined {
    const tabParam = this.route.snapshot.queryParamMap.get(this.tabQueryParamName())?.toLowerCase();
    if (!tabParam) {
      return undefined;
    }

    const index = this.tabs().findIndex((tab) => tab.textLabel.toLowerCase() === tabParam);
    return index === -1 ? undefined : index;
  }

  private persistTabInUrl(label: string, replaceUrl = false): void {
    if (this.route.snapshot.queryParamMap.get(this.tabQueryParamName()) === label) {
      return;
    }

    const queryParams: Params = {};
    queryParams[this.tabQueryParamName()] = label;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: replaceUrl,
    });
  }
}
