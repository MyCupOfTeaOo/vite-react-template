import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import lodash from 'lodash-es';

export function useQuery() {
  const { search } = useLocation();
  return useMemo(
    () => lodash.fromPairs(Array.from(new URLSearchParams(search).entries())),
    [search],
  );
}
