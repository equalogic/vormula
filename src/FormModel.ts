import { FormModelField, FormModelFieldSchema } from './FormModelField';
import { ServerValidationError } from './validation/ServerValidationError';
import { ValidationRuleViolation } from './validation/ValidationRuleViolation';

export type FormModelData = Record<string, any>;

export type FormModelSchema<TData extends FormModelData = FormModelData> = {
  [K in keyof TData]: FormModelFieldSchema<TData[K]>;
};

export type FormModelFields<TData extends FormModelData = FormModelData> = {
  [K in keyof TData]: FormModelField<TData[K]>;
};

export interface FormModelError {
  message: string;
  value?: any;
}

export class FormModel<TData extends FormModelData = FormModelData> {
  public fields: FormModelFields<TData>;
  public errors: FormModelError[] = [];

  public constructor(schema: FormModelSchema<TData>) {
    this.fields = Object.keys(schema).reduce((result, key: keyof TData) => {
      const field = schema[key];

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      result[key] = {
        name: key,
        initialValue: field.value,
        value: field.value,
        type: field.type ?? 'text',
        required: false,
        errors: [],
        validationRules: [],
        ...field,
      } as FormModelField<TData[typeof key]>;

      return result;
    }, {} as FormModelFields<TData>);
  }

  public get data(): Partial<TData> {
    return Object.keys(this.fields).reduce((data: Partial<TData>, key: keyof TData) => {
      data[key] = this.fields[key].value;

      return data;
    }, {} as Partial<TData>);
  }

  public get hasChanged(): boolean {
    return Object.values(this.fields).some(field => field.value !== field.initialValue);
  }

  public get hasErrors(): boolean {
    return (
      this.errors.length > 0 ||
      Object.values(this.fields).some(field => field.errors != null && field.errors.length > 0)
    );
  }

  public initialise(data: Partial<TData>): void {
    Object.keys(data).forEach(key => {
      const value = data[key];

      if (this.fields[key] == null) {
        console.warn(`Unable to initialise non-existent form field with key '${key}'`);

        return;
      }

      this.fields[key].initialValue = value;
      this.fields[key].value = value;
    });
  }

  public get<K extends keyof TData>(key: K): TData[K] | undefined {
    if (this.fields[key] === undefined) {
      throw new Error(`Unable to get value of field '${key}' because it is not defined in the FormModel.`);
    }

    return this.fields[key].value;
  }

  public set<K extends keyof TData>(key: K, value: TData[K]): void {
    if (this.fields[key] === undefined) {
      throw new Error(`Unable to set value of field '${key}' because it is not defined in the FormModel.`);
    }

    this.fields[key].value = value;
  }

  public clearErrors(): void {
    this.fields = Object.keys(this.fields).reduce((result, key: keyof TData) => {
      const field = this.fields[key];

      result[key] = {
        ...field,
        errors: [],
      };

      return result;
    }, {} as FormModelFields<TData>);

    this.errors = [];
  }

  public applyServerValidationErrorToFields(error: ServerValidationError): void {
    // When there are no violations, add a root-level error on the FormModel
    if (error.violations.length === 0) {
      this.errors = [
        ...this.errors,
        {
          message: error.message,
        },
      ];

      return;
    }

    const unmappedViolations: ValidationRuleViolation[] = [];

    error.violations.forEach(violation => {
      let appliedToField: boolean = false;

      // Convert ValidationRuleViolation to FormModelError
      const fieldError: FormModelError = {
        message: violation.message,
        value: violation.value,
      };

      Object.values<FormModelField>(this.fields)
        .filter(candidateField => {
          // Default paths to {fieldName} and input.{fieldName}, if no paths are set
          const fieldPaths: (string | string[])[] = candidateField.paths ?? [
            candidateField.name,
            `input.${candidateField.name}`,
          ];
          // Paths may be a dotted string like 'input.name' or an array like ['input', 'name']
          const normalizedFieldPaths: string[] = fieldPaths.map(errorPath => {
            return Array.isArray(errorPath) ? errorPath.join('.') : errorPath;
          });

          // Filter to only fields that match this violation's path
          return normalizedFieldPaths.includes(violation.path.join('.'));
        })
        .forEach(field => {
          // Apply the violation to the field
          field.errors = [...(field.errors ?? []), fieldError];
          appliedToField = true;
        });

      if (!appliedToField) {
        unmappedViolations.push(violation);
      }
    });

    // Add any unmapped violations as root-level errors on the FormModel
    if (unmappedViolations.length > 0) {
      this.errors = [
        ...this.errors,
        ...unmappedViolations.map(violation => ({
          message: violation.message,
          value: violation.value,
        })),
      ];
    }
  }
}
