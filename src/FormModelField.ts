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
  | 'autocomplete'
  | 'checkbox'
  | 'switch'
  | 'radio'
  | 'radiobutton'
  | 'hidden'
  | string;

export interface FormModelFieldOption {
  key?: string;
  value: any;
  label: string;
}

export type FormModelFieldValidationRules = string[] | Record<string, boolean | Record<string, any>>;

export interface FormModelFieldTransformer<TValue = any, TOutput = any> {
  toModelValue(input: TOutput | TValue | undefined): TValue;

  toOutputValue(input: TValue | undefined): TOutput;
}

export interface FormModelFieldSchema<TValue = any, TOutput = TValue> {
  label: string;
  type?: FormModelFieldType;
  value?: TValue;
  options?: FormModelFieldOption[] | (() => FormModelFieldOption[]);
  required?: boolean;
  validationRules?: FormModelFieldValidationRules;
  paths?: string[] | string[][];
  transform?: FormModelFieldTransformer<TValue, TOutput>;
}

export interface FormModelField<TValue = any, TOutput = any> extends FormModelFieldSchema<TValue, TOutput> {
  name: string;
  type: FormModelFieldType;
  initialValue?: TValue;
  required: boolean;
  validationRules: FormModelFieldValidationRules;
  errors: FormModelError[];
}
