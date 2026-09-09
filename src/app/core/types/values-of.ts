/**
 * The union of a `readonly` array's element types -- the string-union-from-const-array idiom.
 *
 * ```ts
 * export const USER_ROLES = ['Reader', 'Admin'] as const;
 * export type UserRole = ValuesOf<typeof USER_ROLES>; // 'Reader' | 'Admin'
 * ```
 *
 * Constrained to `readonly unknown[]` rather than a non-empty tuple so it also accepts arrays
 * derived at runtime, e.g. `ENCLAVE_STATUSES`, which is built with `[...new Set(...)] as const`
 * and is therefore typed as a plain readonly array rather than a tuple literal.
 *
 * Import it with `import type` -- it has no runtime representation, so the import is erased and
 * no `domain -> core` dependency reaches the bundle.
 */
export type ValuesOf<T extends readonly unknown[]> = T[number];
