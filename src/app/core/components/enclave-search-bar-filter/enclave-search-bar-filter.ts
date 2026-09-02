import { Component, effect, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EnsyLabsIcon } from '@enclave/core/icons';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

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

  public readonly searchPlaceholder = input.required<string>();
  public readonly urlQueryParamPropagationDebounceTime = input(400);
  public readonly urlQueryParamName = input('search');
  public readonly searchText = signal('');

  constructor() {
    // Initial state load from URL and responsiveness to url changes
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const value = (params.get(this.urlQueryParamName()) ?? '').trim();
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
