import { FormModel } from './FormModel';

describe('FormModel', () => {
  describe('set', () => {
    it('Sets a field value', () => {
      const formModel = new FormModel({
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
      const formModel = new FormModel({
        name: {
          label: 'Your name',
          type: 'text',
          value: 'Joe Bloggs',
        },
      });

      expect(formModel.get('name')).toEqual('Joe Bloggs');
    });
  });

  describe('data', () => {
    it('Returns all form field values', () => {
      const formModel = new FormModel({
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
      const formModel = new FormModel({
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
      const formModel = new FormModel({
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
});
