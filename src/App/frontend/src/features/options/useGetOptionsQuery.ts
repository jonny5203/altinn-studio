import type { UseQueryResult } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';

import { useOptionsQuery } from 'src/core/queries/options';
import { FormStore } from 'src/features/form/FormContext';
import { FormBootstrap } from 'src/features/formBootstrap/FormBootstrap';
import { useLaxInstanceId } from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { castOptionsToStrings } from 'src/features/options/castOptionsToStrings';
import { useResolvedQueryParameters } from 'src/features/options/evalQueryParameters';
import { getOptionsUrl } from 'src/utils/urls/appUrlHelper';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { IMapping, IQueryParameters } from 'src/layout/common.generated';

export const useGetOptionsQuery = (
  url: string | undefined,
): UseQueryResult<{ data: IOptionInternal[]; headers: AxiosResponse['headers'] } | null> => {
  const result = useOptionsQuery(url);

  return {
    ...result,
    data: result.data
      ? {
          headers: result.data.headers,
          data: castOptionsToStrings(result.data.data),
        }
      : result.data,
  } as UseQueryResult<{ data: IOptionInternal[]; headers: AxiosResponse['headers'] } | null>;
};

export const useGetOptionsUrl = (
  optionsId: string | undefined,
  mapping?: IMapping,
  queryParameters?: IQueryParameters,
  secure?: boolean,
): string | undefined => {
  const mappingResult = FormStore.data.useMapping(mapping, FormBootstrap.useDefaultDataType());
  const language = useCurrentLanguage();
  const instanceId = useLaxInstanceId();
  const resolvedQueryParameters = useResolvedQueryParameters(queryParameters);

  return optionsId
    ? getOptionsUrl({
        optionsId,
        language,
        queryParameters: {
          ...mappingResult,
          ...resolvedQueryParameters,
        },
        secure,
        instanceId,
      })
    : undefined;
};
