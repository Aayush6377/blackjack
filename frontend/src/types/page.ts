export interface PageQueryParams<TFilters = Record<string, unknown>> {
  page?: number;
  limit?: number;
  orderBy?: string;
  direction?: "ASC" | "DESC";
  search?: string;
  filters?: TFilters;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}