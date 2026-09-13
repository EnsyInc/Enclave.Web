import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  contentChildren,
  DestroyRef,
  Directive,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { debounceTime, take } from 'rxjs';

@Directive({
  selector: 'mat-tab-group[enclavePersistentTab]',
})
export class EnclavePersistentTab implements AfterViewInit {
  private readonly tabGroup = inject(MatTabGroup);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly appRef = inject(ApplicationRef);
  // Resolves to the enclosing OnPush component's (e.g. OrganizationDetails/LicenseDetails) view,
  // since this directive sits on that component's own template -- see restoreIndexWithoutAnimation.
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly tabs = contentChildren(MatTab);

  public readonly tabQueryParamName = input<string>('tab');

  ngAfterViewInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const restoredIndex = this.parseTabQueryParam();
      if (restoredIndex !== undefined && restoredIndex !== this.tabGroup.selectedIndex) {
        this.restoreIndexWithoutAnimation(restoredIndex);
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

  // Suppresses the tab-switch animation for a restore, since Material only skips it on true first render.
  private restoreIndexWithoutAnimation(restoredIndex: number): void {
    const originalDuration = this.tabGroup.animationDuration;
    this.tabGroup.animationDuration = '0ms';

    queueMicrotask(() => {
      this.tabGroup.selectedIndex = restoredIndex;
      // MatTabGroup only resolves that assignment into its readable `selectedIndex` (and the
      // actual tab-body swap) during its own ngAfterContentChecked. In this app's zoneless
      // setup, appRef.tick() alone can silently skip that OnPush ancestor's subtree -- e.g. when
      // two restores land close together (two fast browser-back navigations) -- so the tab never
      // visibly changes even though the URL did. markForCheck() ensures this tick actually
      // descends into it.
      this.changeDetectorRef.markForCheck();
      this.appRef.tick();
      this.tabGroup.animationDone.pipe(take(1)).subscribe(() => {
        this.afterTwoAnimationFrames(() => {
          this.tabGroup.animationDuration = originalDuration;
        });
      });
    });
  }

  private afterTwoAnimationFrames(callback: () => void): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(callback);
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
