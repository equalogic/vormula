import { formDataToQueryParams } from './formDataToQueryParams';

describe('formDataToQueryParams', () => {
  it('Converts simple form data to query parameters', () => {
    const query = formDataToQueryParams({
      name: 'Joe Bloggs',
    });

    expect(query).toEqual({
      name: 'Joe Bloggs',
    });
  });

  it('Adds prefix to query parameter names', () => {
    const query = formDataToQueryParams(
      {
        name: 'Joe Bloggs',
      },
      'filter.',
    );

    expect(query).toEqual({
      'filter.name': 'Joe Bloggs',
    });
  });

  it('Converts numeric and boolean values in form data to strings', () => {
    const query = formDataToQueryParams({
      age: 42,
      cool: true,
    });

    expect(query).toEqual({
      age: '42',
      cool: 'true',
    });
  });

  it('Converts array values in form data to strings', () => {
    const query = formDataToQueryParams({
      fruits: ['banana', 'apple', 'pear'],
    });

    expect(query).toEqual({
      fruits: 'banana,apple,pear',
    });
  });
});
