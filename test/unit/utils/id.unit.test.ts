import { genId } from '../../../src/utils/id';

describe('Id', () => {
  it('should be able to create id', () => {
    const d = jest.spyOn(Date, 'now');
    const r = jest.spyOn(Math, 'random');
    d.mockReturnValue(1735115003339);
    r.mockReturnValue(0.00123456789);
    expect(genId()).toBe('193fce9d5cb-00123456');
    d.mockRestore();
    r.mockRestore();
  });
});