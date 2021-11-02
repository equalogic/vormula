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
});
