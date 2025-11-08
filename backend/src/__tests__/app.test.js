const app = require('../app');

describe('basic app export', () => {
  test('app is an express function', () => {
    expect(typeof app).toBe('function');
  });
});
