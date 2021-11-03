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
