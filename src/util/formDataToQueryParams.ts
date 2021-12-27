import { FormModelOutputValues, FormModelValues } from '../FormModel';

export function formDataToQueryParams<TData extends FormModelOutputValues<FormModelValues>>(
  data: TData,
  prefix: string = '',
): Record<string, string | undefined> {
  return Object.keys(data).reduce((query, key) => {
    const queryKey = `${prefix}${key}`;
    const value = data[key];

    if (value == null || value.length === 0) {
      query[queryKey] = undefined;
    } else {
      query[queryKey] = String(value);
    }

    return query;
  }, {} as Record<string, string | undefined>);
}
