import { FormModel } from './FormModel';

describe('FormModel', () => {
  describe('data', () => {
    it('Returns form field values', () => {
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
