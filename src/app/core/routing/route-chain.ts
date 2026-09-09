import { ActivatedRoute } from '@angular/router';

/**
 * The activated route chain, from `root` down the `firstChild` links, root first.
 *
 * The router's own `routerState.root` is a synthetic node above every configured route, so it
 * carries no route `data` of its own -- callers that only care about configured routes should
 * skip the first entry.
 *
 * Returns routes rather than their `snapshot.data` so callers can reach params, url segments
 * or anything else on the snapshot without a second walk.
 */
export function routeChain(root: ActivatedRoute): ActivatedRoute[] {
  const chain: ActivatedRoute[] = [];

  for (let route: ActivatedRoute | null = root; route; route = route.firstChild) {
    chain.push(route);
  }

  return chain;
}
