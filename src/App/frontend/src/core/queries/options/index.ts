import { useQuery } from '@tanstack/react-query';

import { useOptionsApi } from 'src/core/contexts/ApiProvider';
import { dataListQuery, optionsQuery } from 'src/core/queries/options/options.queries';

export function useOptionsQuery(url: string | undefined) {
  const optionsApi = useOptionsApi();
  return useQuery(optionsQuery({ url, optionsApi }));
}

export function useDataListQuery(url: string | undefined) {
  const optionsApi = useOptionsApi();
  return useQuery(dataListQuery({ url, optionsApi }));
}
