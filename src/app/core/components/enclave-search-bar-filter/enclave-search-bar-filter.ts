import { Component, effect, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { EnsyLabsIcon } from '@enclave/core/icons';

@Component({
  selector: 'enclave-search-bar-filter',
  imports: [EnsyLabsIcon, MatInputModule],
  templateUrl: './enclave-search-bar-filter.html',
  styleUrl: './enclave-search-bar-filter.scss',
})
export class EnclaveSearchBarFilter {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchInput$ = new Subject<string>();
  private readonly searchInputRef = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  // Set only from outside the input itself (URL nav) - pushed into the DOM imperatively below.
  // Typing never touches this, so it never fights the browser over the value mid-keystroke.
  private readonly externalSearchText = signal<string | null>(null);
  // The value from our own most recent router.navigate() call, so its queryParamMap echo can be
  // told apart from a genuine external navigation (browser back/forward, direct URL edit). null
  // means we haven't navigated yet, so the initial URL load is always accepted.
  private lastSentSearchText: string | null = null;

  public readonly searchPlaceholder = input.required<string>();
  public readonly urlQueryParamPropagationDebounceTime = input(400);
  public readonly urlQueryParamName = input('search');
  public readonly searchText = signal('');

  constructor() {
    // Initial state load from URL and responsiveness to url changes
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const value = (params.get(this.urlQueryParamName()) ?? '').trim();

      // router.navigate() is async: its queryParamMap echo can arrive after the user has
      // already typed something newer. Ignore it in that case so it doesn't stomp the newer
      // local edit - the newer edit will send its own navigation once its debounce elapses.
      const isStaleEcho =
        this.lastSentSearchText !== null &&
        value === this.lastSentSearchText &&
        this.searchText() !== this.lastSentSearchText;
      if (isStaleEcho) {
        return;
      }

      this.searchText.set(value);
      this.externalSearchText.set(value);
    });

    effect(() => {
      const value = this.externalSearchText();
      if (value !== null) {
        this.searchInputRef().nativeElement.value = value;
      }
    });

    // SearchInput => navigation (after debounce)
    this.searchInput$
      .pipe(
        debounceTime(this.urlQueryParamPropagationDebounceTime()),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((search) => {
        if (search !== this.searchText()) {
          return;
        }

        if (this.router.getCurrentNavigation()) {
          return;
        }

        this.lastSentSearchText = search;

        const queryParams: Params = {};
        queryParams[this.urlQueryParamName()] = search || null;

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: queryParams,
          queryParamsHandling: 'merge',
        });
      });
  }

  protected applySearchTerm(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.writeToSearchText(inputValue);
    this.searchInput$.next(inputValue);
  }

  private writeToSearchText(text: string | null | undefined) {
    const sanitized = (text ?? '').trim();
    this.searchText.set(sanitized);
  }
}
