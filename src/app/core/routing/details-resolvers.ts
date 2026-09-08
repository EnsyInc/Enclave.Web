import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';

const NOT_FOUND_URL = '/not-found';

export interface DetailsEntity {
  name: string;
}

export interface DetailsResolversOptions<T extends DetailsEntity> {
  /** Route param holding the entity id, e.g. 'productId'. */
  paramName: string;
  /** First breadcrumb segment, e.g. 'Products'. */
  collectionLabel: string;
  /** Document title used when the entity can't be found, e.g. 'Product Details'. */
  defaultTitle: string;
  /**
   * Looks the entity up by id. Invoked inside the resolver's injection context, so it can
   * call `inject()` directly: `(id) => inject(ProductService).getProductById(id)`.
   */
  findById: (id: string) => T | undefined;
}

export function createDetailsResolvers<T extends DetailsEntity>(
  options: DetailsResolversOptions<T>,
): { breadcrumb: ResolveFn<string[]>; title: ResolveFn<string> } {
  const breadcrumb: ResolveFn<string[]> = (route) => {
    const entity = options.findById(route.paramMap.get(options.paramName)!);

    if (!entity) {
      return new RedirectCommand(inject(Router).parseUrl(NOT_FOUND_URL));
    }

    return [options.collectionLabel, entity.name];
  };

  const title: ResolveFn<string> = (route) => {
    const entity = options.findById(route.paramMap.get(options.paramName)!);

    return entity?.name ?? options.defaultTitle;
  };

  return { breadcrumb, title };
}
