import { Minivium } from '../../src';

describe('Minivium', () => {
  it('should run minivium', () => {
    expect(new Minivium().hello()).toBe('Minivium');
  });
});