import { FormModelError } from './FormModel';

export type FormModelFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'search'
  | 'number'
  | 'range'
  | 'color'
  | 'tel'
  | 'url'
  | 'date'
  | 'time'
  | 'datetime'
  | 'datetime-local'
  | 'week'
  | 'month'
  | 'file'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'hidden';

export interface FormModelFieldOption {
  key?: string;
  value: string;
  label: string;
}

export type FormModelFieldValidationRules = string[] | Record<string, boolean | Record<string, any>>;

export interface FormModelFieldInput<TValue = any> {
  label: string;
  name?: string;
  type?: FormModelFieldType;
  value?: TValue;
  options?: FormModelFieldOption[] | (() => FormModelFieldOption[]);
  required?: boolean;
  validationRules?: FormModelFieldValidationRules;
  paths?: string[] | string[][];
}

export interface FormModelField<TValue = any> extends FormModelFieldInput<TValue> {
  name: string;
  type: FormModelFieldType;
  initialValue?: TValue;
  value: TValue;
  required: boolean;
  validationRules: FormModelFieldValidationRules;
  errors: FormModelError[];
}
