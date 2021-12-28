import { FormModel, FormModelError } from './FormModel';

describe('FormModel', () => {
  describe('set', () => {
    it('Sets a field value', () => {
      const formModel = new FormModel<{ name: string }>({
        name: {
          label: 'Your name',
          type: 'text',
        },
      });
      formModel.set('name', 'Joe Bloggs');

      expect(formModel.fields.name.value).toEqual('Joe Bloggs');
    });
  });

  describe('get', () => {
    it('Gets a field value', () => {
      const formModel = new FormModel<{ name: string }>({
        name: {
          label: 'Your name',
          type: 'text',
          value: 'Joe Bloggs',
        },
      });

      expect(formModel.get('name')).toEqual('Joe Bloggs');
    });
  });

  describe('initialise', () => {
    it('Initialises fields with given values', () => {
      const formModel = new FormModel<{ name: string }>({
        name: {
          label: 'Your name',
          type: 'text',
          value: 'Joe Bloggs',
        },
      });
      formModel.initialise({ name: 'Joseph Bloggs' });

      expect(formModel.fields.name.initialValue).toEqual('Joseph Bloggs');
      expect(formModel.fields.name.value).toEqual('Joseph Bloggs');
    });
  });

  describe('data', () => {
    it('Returns all form field values', () => {
      const formModel = new FormModel<{ name: string }>({
        name: {
          label: 'Your name',
          type: 'text',
        },
      });
      formModel.set('name', 'Joe Bloggs');

      expect(formModel.data).toEqual({ name: 'Joe Bloggs' });
    });

    it('Transforms form field values when given a transformer', () => {
      const formModel = new FormModel<{ birthdate: Date | null }, { birthdate: string | null }>({
        birthdate: {
          label: 'Your DOB',
          type: 'date',
          transform: {
            toModelValue(input: string | undefined): Date | null {
              if (input == null) {
                return null;
              }

              return new Date(input);
            },
            toOutputValue(input: Date | undefined): string | null {
              if (input == null) {
                return null;
              }

              return input.toISOString();
            },
          },
        },
      });

      formModel.initialise({ birthdate: '1980-01-01' });
      expect(formModel.data).toEqual({ birthdate: '1980-01-01T00:00:00.000Z' });

      formModel.initialise({ birthdate: new Date('1965-04-04') });
      expect(formModel.data).toEqual({ birthdate: '1965-04-04T00:00:00.000Z' });

      formModel.set('birthdate', new Date('1950-06-06'));
      expect(formModel.data).toEqual({ birthdate: '1950-06-06T00:00:00.000Z' });

      formModel.set('birthdate', null);
      expect(formModel.data).toEqual({ birthdate: null });
    });

    it('Returns form field under different name if specified', () => {
      const formModel = new FormModel<{ potato: string }, { banana: string }>({
        potato: {
          name: 'banana',
          label: 'Food',
          type: 'text',
        },
      });
      formModel.set('potato', 'Yummy');

      expect(formModel.data).toEqual({ banana: 'Yummy' });
    });
  });

  describe('hasChanged', () => {
    it('Is true if any field has a value different from its initialValue', () => {
      const formModel = new FormModel<{ name: string }>({
        name: {
          label: 'Your name',
          type: 'text',
        },
      });
      formModel.initialise({ name: 'Joe Bloggs' });
      formModel.set('name', 'Joseph Bloggs');

      expect(formModel.hasChanged).toBe(true);
    });

    it('Is false if all fields have values equal to their initialValues', () => {
      const formModel = new FormModel<{ name: string }>({
        name: {
          label: 'Your name',
          type: 'text',
        },
      });
      formModel.initialise({ name: 'Joe Bloggs' });
      formModel.set('name', 'Joe Bloggs');

      expect(formModel.hasChanged).toBe(false);
    });
  });

  describe('applyServerValidationErrorToFields', () => {
    it('Maps given errors by field paths using dotted.path.notation', () => {
      const formModel = new FormModel<{ name: string }>({
        name: {
          label: 'Your name',
          type: 'text',
          paths: ['input.name'],
        },
      });
      formModel.applyServerValidationErrorToFields({
        error: new Error(),
        message: 'Invalid input',
        violations: [
          {
            path: ['input', 'name'],
            message: 'Name is required!',
            value: null,
          },
        ],
      });

      expect(formModel.hasErrors).toBe(true);
      expect(formModel.fields.name.errors).toEqual<FormModelError[]>([
        {
          message: 'Name is required!',
          value: null,
        },
      ]);
    });

    it('Maps given errors by field paths using [array,path] notation', () => {
      const formModel = new FormModel<{ name: string }>({
        name: {
          label: 'Your name',
          type: 'text',
          paths: [['input', 'name'], ['foo']],
        },
      });
      formModel.applyServerValidationErrorToFields({
        error: new Error(),
        message: 'Invalid input',
        violations: [
          {
            path: ['input', 'name'],
            message: 'Name is required!',
            value: null,
          },
        ],
      });

      expect(formModel.hasErrors).toBe(true);
      expect(formModel.fields.name.errors).toEqual<FormModelError[]>([
        {
          message: 'Name is required!',
          value: null,
        },
      ]);
    });

    it('Applies unmapped errors to the FormModel', () => {
      const formModel = new FormModel<{ name: string }>({
        name: {
          label: 'Your name',
          type: 'text',
          paths: ['input.name'],
        },
      });
      formModel.applyServerValidationErrorToFields({
        error: new Error(),
        message: 'Invalid input',
        violations: [
          {
            path: ['foo'],
            message: 'Unmappable form error!',
            value: null,
          },
        ],
      });

      expect(formModel.hasErrors).toBe(true);
      expect(formModel.errors).toEqual<FormModelError[]>([
        {
          message: 'Unmappable form error!',
          value: null,
        },
      ]);
    });
  });

  describe('clearErrors', () => {
    it('Clears errors from FormModel and all fields', () => {
      const formModel = new FormModel<{ name: string; age: number }>({
        name: {
          label: 'Your name',
          type: 'text',
          paths: ['input.name'],
        },
        age: {
          label: 'Your age',
          type: 'number',
          paths: ['input.age'],
        },
      });
      formModel.applyServerValidationErrorToFields({
        error: new Error(),
        message: 'Invalid input',
        violations: [
          {
            path: ['foo'],
            message: 'Unmappable form error!',
            value: null,
          },
          {
            path: ['name'],
            message: 'Name is required!',
            value: null,
          },
        ],
      });
      formModel.clearErrors();

      expect(formModel.hasErrors).toBe(false);
      expect(formModel.errors).toEqual([]);
      expect(formModel.fields.name.errors).toEqual([]);
    });
  });
});
