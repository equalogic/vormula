import { FormModelField, FormModelFieldInput } from './FormModelField';
import { ServerValidationError } from './validation/ServerValidationError';
import { ValidationRuleViolation } from './validation/ValidationRuleViolation';

export interface FormModelError {
  message: string;
  value?: any;
}

type FormModelFieldsInput = Record<string, FormModelFieldInput>;
type FormModelFields<TFieldsInput extends FormModelFieldsInput> = {
  [K in keyof TFieldsInput]: FormModelField<
    TFieldsInput[K]['value'] extends undefined ? string : TFieldsInput[K]['value']
  >;
};
type FormModelData<TFieldsInput extends FormModelFieldsInput> = {
  [K in keyof TFieldsInput]: TFieldsInput[K]['value'] extends undefined ? string : TFieldsInput[K]['value'];
};

export class FormModel<TFieldsInput extends FormModelFieldsInput = FormModelFieldsInput> {
  public fields: FormModelFields<TFieldsInput>;
  public errors: FormModelError[] = [];

  public constructor(fields: TFieldsInput) {
    this.fields = Object.keys(fields).reduce((result, key: keyof TFieldsInput) => {
      const field = fields[key];

      if (field.name !== undefined && field.name !== key) {
        throw new Error(
          `Error constructing FormModel: Field with key "${key}" has name attribute "${field.name}". The name, if specified, must be equal to the key.`,
        );
      }

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      result[key] = {
        name: key,
        initialValue: field.value ?? '',
        value: field.value ?? '',
        type: field.type ?? 'text',
        required: false,
        errors: [],
        validationRules: [],
        ...field,
      } as FormModelFields<TFieldsInput>[typeof key];

      return result;
    }, {} as FormModelFields<TFieldsInput>);
  }

  public get data(): FormModelData<TFieldsInput> {
    return Object.values(this.fields).reduce((result, field) => {
      result[field.name] = field.value;

      return result;
    }, {} as FormModelData<TFieldsInput>);
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

  public initialise(data: Partial<FormModelData<TFieldsInput>>): void {
    Object.keys(data).forEach(key => {
      const value = data[key];

      this.fields[key].initialValue = value;

      if (value != null) {
        this.fields[key].value = value;
      }
    });
  }

  public get<K extends keyof TFieldsInput>(key: K): TFieldsInput[K]['value'] {
    if (this.fields[key] === undefined) {
      throw new Error(`Unable to get value of field '${key}' because it is not defined in the FormModel.`);
    }

    return this.fields[key].value;
  }

  public set<K extends keyof TFieldsInput>(key: K, value: TFieldsInput[K]['value']): void {
    if (this.fields[key] === undefined) {
      throw new Error(`Unable to set value of field '${key}' because it is not defined in the FormModel.`);
    }

    this.fields[key].value = value;
  }

  public clearErrors(): void {
    this.fields = Object.keys(this.fields).reduce((result, key: keyof TFieldsInput) => {
      const field = this.fields[key];

      result[key] = {
        ...field,
        errors: [],
      };

      return result;
    }, {} as FormModelFields<TFieldsInput>);

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
