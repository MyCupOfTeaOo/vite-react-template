// export type FilterType = string | number | boolean | undefined;

export type Filter = Partial<{
  [key: string]: any;
}>;

export type Sort = {
  colId: string;
  sort: 'asc' | 'desc';
};

export type PaginationBody = {
  page?: number;
  len?: number;
  queryData?: Filter;
  sortColumns?: Sort[];
};

export interface Pagination<T = unknown, F = unknown> {
  totalitem?: number;
  list?: T[];
  footer?: F[];
}
