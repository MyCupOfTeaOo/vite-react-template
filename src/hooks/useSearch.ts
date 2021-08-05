import { Pagination, PaginationBody, Sort } from '@/models/Pagination';
import { ReqResponse } from '@/utils/request';
import { useCallback, useMemo, useRef } from 'react';
import { useHistory, useLocation } from 'react-router';
import { GridApi, SortModelItem } from 'ag-grid-community';
import useSWR, { SWRConfiguration } from 'swr';
import qs from 'qs';
import { useValue } from 'teaness';
import usePureFetch from './usePureFetch';
import { useQuery } from './useQuery';

export function getQueryParse<T>(
  key?: string,
  query?: Record<string, any>,
  defaultValue?: T,
): T | undefined {
  if (!key) return defaultValue;
  if (!query) return defaultValue;
  if (!query[key]) return defaultValue;
  const search = JSON.parse(query[key]);
  return search;
}

export function useQueryData(
  key?: string,
  // 默认查询参数
  defaultValue?: PaginationBody,
) {
  const query = useQuery();
  const location = useLocation();
  const history = useHistory();
  const queryDataV = useValue(() => {
    return getQueryParse(key, query, defaultValue);
  });

  const setQuery = useCallback((body: PaginationBody) => {
    queryDataV.setValue({
      ...queryDataV.value,
      ...body,
    });
    if (key) {
      history.replace({
        pathname: location.pathname,
        state: location.state,
        search: qs.stringify({
          ...query,
          [key]: JSON.stringify(queryDataV.value),
        }),
      });
    }
  }, []);

  const resetQuery = useCallback(() => {
    queryDataV.setValue(defaultValue);
  }, [defaultValue]);

  return {
    queryDataV,
    query: queryDataV.value,
    setQuery,
    resetQuery,
  };
}

export default function useSearch<T = unknown>(
  key: string,
  fetch: (body: PaginationBody) => Promise<ReqResponse<Pagination<T>>>,
  defaultValue?: PaginationBody,
  // 默认查询参数
  swrconfig?: SWRConfiguration<Pagination<T>>,
) {
  const queryDataProps = useQueryData(key, defaultValue);
  const sorters = useRef<SortModelItem[] | undefined>(
    queryDataProps.query?.sortColumns,
  );
  const newFetch = useCallback(
    (body: string) => {
      return fetch(JSON.parse(body));
    },
    [fetch],
  );

  const queryStr = useMemo(() => {
    return JSON.stringify(queryDataProps.query);
  }, [queryDataProps.query]);

  const swrProps = useSWR(
    [key, queryStr],
    usePureFetch(newFetch, true),
    swrconfig,
  );
  const onPaginationChange = useCallback(
    (page: number, pageSize?: number) => {
      queryDataProps.setQuery({ page, len: pageSize });
    },
    [queryDataProps.setQuery],
  );

  const onSortChanged = useCallback(
    ({ api }: { api: GridApi }) => {
      const sortModal = api.getSortModel();
      if (
        queryDataProps.queryDataV.value?.sortColumns?.length ===
        sortModal.length
      ) {
        // 浅对比
        if (queryDataProps.queryDataV.value.sortColumns.length === 0) {
          return;
        }
        // 深对比
        if (
          queryDataProps.queryDataV.value.sortColumns.every((sorter) =>
            sortModal.some(
              (item) =>
                item.colId === sorter.colId && item.sort === sorter.sort,
            ),
          )
        ) {
          return;
        }
      }
      queryDataProps.setQuery({
        sortColumns: sortModal as Sort[],
      });
      sorters.current = sortModal as Sort[];
    },
    [queryDataProps.setQuery],
  );
  const reload = useCallback(() => {
    swrProps.mutate();
  }, [swrProps.mutate, key, queryStr]);
  return {
    ...queryDataProps,
    ...swrProps,
    reload,
    gridProps: {
      onPaginationChange,
      page: queryDataProps.query?.page,
      pageSize: queryDataProps.query?.len,
      total: swrProps.data?.totalitem,
      footer: swrProps.data?.footer,
      rowData: swrProps.data?.list,
      onSortChanged,
      error: swrProps.error,
      sorters: sorters.current,
    },
  };
}
