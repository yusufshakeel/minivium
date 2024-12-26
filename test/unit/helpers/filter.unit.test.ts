import { filter } from '../../../src/helpers/filter';
import { Op } from '../../../src/core/Operators';

describe('filter', () => {
  const data = [
    { id: 1, name: 'john', score: 20, isOnline: false, status: 'active', createdAt: '2024-12-01' },
    { id: 2, name: 'jane', score: 30, isOnline: true, status: 'active', createdAt: '2024-12-01' },
    { id: 3, name: 'tom', score: 40, isOnline: false, status: 'inactive', createdAt: '2024-12-02' },
    { id: 4, name: 'jerry', score: 30, isOnline: true, status: 'active', createdAt: '2024-12-03' },
    { id: 5, name: 'bruce', score: 50, isOnline: true, status: 'active', createdAt: '2024-12-05' }
  ];

  it('should throw error for invalid operator', () => {
    expect(() => {
      filter(data, { id: { hahaOp: 1 } });
    }).toThrow('Unsupported operator: hahaOp');
  });

  it('should fetch everything if filter option is not provided', () => {
    expect(filter(data, {})).toStrictEqual(data);
  });

  it('should empty array when no condition is met', () => {
    const result = filter(data, { id: 1000 });
    expect(result).toStrictEqual([]);
  });

  it('should return matching entries by id', () => {
    const result = filter(data, { id: 2 });
    expect(result).toStrictEqual([
      { id: 2, name: 'jane', score: 30, isOnline: true, status: 'active', createdAt: '2024-12-01' }
    ]);
  });

  it('should return matching entries by eq', () => {
    const result = filter(data, { id: { [Op.eq]: 2 } });
    expect(result).toStrictEqual([
      { id: 2, name: 'jane', score: 30, isOnline: true, status: 'active', createdAt: '2024-12-01' }
    ]);
  });

  it('should return matching entries by notEq', () => {
    const result =
      filter(data, { status: { [Op.notEq]: 'active' } });
    expect(result).toStrictEqual([
      { id: 3, name: 'tom', score: 40, isOnline: false, status: 'inactive', createdAt: '2024-12-02' }
    ]);
  });

  it('should return matching entries by in', () => {
    const result =
      filter(data, { score: { [Op.in]: [30, 40] } });
    expect(result).toStrictEqual([
      { id: 2, name: 'jane', score: 30, isOnline: true, status: 'active', createdAt: '2024-12-01' },
      { id: 3, name: 'tom', score: 40, isOnline: false, status: 'inactive', createdAt: '2024-12-02' },
      { id: 4, name: 'jerry', score: 30, isOnline: true, status: 'active', createdAt: '2024-12-03' }
    ]);
  });

  it('should return matching entries by notIn', () => {
    const result =
      filter(data, { score: { [Op.notIn]: [30, 40] } });
    expect(result).toStrictEqual([
      { id: 1, name: 'john', score: 20, isOnline: false, status: 'active', createdAt: '2024-12-01' },
      { id: 5, name: 'bruce', score: 50, isOnline: true, status: 'active', createdAt: '2024-12-05' }
    ]);
  });

  it('should return matching entries by gt', () => {
    const result =
      filter(data, { score: { [Op.gt]: 40 } });
    expect(result).toStrictEqual([
      { id: 5, name: 'bruce', score: 50, isOnline: true, status: 'active', createdAt: '2024-12-05' }
    ]);
  });

  it('should return matching entries by gte', () => {
    const result =
      filter(data, { score: { [Op.gte]: 40 } });
    expect(result).toStrictEqual([
      { id: 3, name: 'tom', score: 40, isOnline: false, status: 'inactive', createdAt: '2024-12-02' },
      { id: 5, name: 'bruce', score: 50, isOnline: true, status: 'active', createdAt: '2024-12-05' }
    ]);
  });

  it('should return matching entries by lt', () => {
    const result =
      filter(data, { score: { [Op.lt]: 40 } });
    expect(result).toStrictEqual([
      { id: 1, name: 'john', score: 20, isOnline: false, status: 'active', createdAt: '2024-12-01' },
      { id: 2, name: 'jane', score: 30, isOnline: true, status: 'active', createdAt: '2024-12-01' },
      { id: 4, name: 'jerry', score: 30, isOnline: true, status: 'active', createdAt: '2024-12-03' }
    ]);
  });

  it('should return matching entries by lte', () => {
    const result =
      filter(data, { score: { [Op.lte]: 40 } });
    expect(result).toStrictEqual([
      { id: 1, name: 'john', score: 20, isOnline: false, status: 'active', createdAt: '2024-12-01' },
      { id: 2, name: 'jane', score: 30, isOnline: true, status: 'active', createdAt: '2024-12-01' },
      { id: 3, name: 'tom', score: 40, isOnline: false, status: 'inactive', createdAt: '2024-12-02' },
      { id: 4, name: 'jerry', score: 30, isOnline: true, status: 'active', createdAt: '2024-12-03' }
    ]);
  });

  it('should return matching entries by between', () => {
    expect(filter(data, { score: { [Op.between]: [30, 50] } })).toStrictEqual([
      { id: 2, name: 'jane', score: 30, isOnline: true, status: 'active', createdAt: '2024-12-01' },
      { id: 3, name: 'tom', score: 40, isOnline: false, status: 'inactive', createdAt: '2024-12-02' },
      { id: 4, name: 'jerry', score: 30, isOnline: true, status: 'active', createdAt: '2024-12-03' },
      { id: 5, name: 'bruce', score: 50, isOnline: true, status: 'active', createdAt: '2024-12-05' }
    ]);

    expect(filter(data, { createdAt: { [Op.between]: ['2024-12-02', '2024-12-05'] } })).toStrictEqual([
      { id: 3, name: 'tom', score: 40, isOnline: false, status: 'inactive', createdAt: '2024-12-02' },
      { id: 4, name: 'jerry', score: 30, isOnline: true, status: 'active', createdAt: '2024-12-03' },
      { id: 5, name: 'bruce', score: 50, isOnline: true, status: 'active', createdAt: '2024-12-05' }
    ]);
  });

  it('should return matching entries by and', () => {
    const result =
      filter(data, {
        [Op.and]: [
          { status: 'active' },
          { score: { [Op.gte]: 40 } }
        ]
      });
    expect(result).toStrictEqual([
      { id: 5, name: 'bruce', score: 50, isOnline: true, status: 'active', createdAt: '2024-12-05' }
    ]);
  });

  it('should return matching entries by or', () => {
    const result =
      filter(data, {
        [Op.or]: [
          { name: 'john' },
          { score: { [Op.gte]: 40 } }
        ]
      });
    expect(result).toStrictEqual([
      { id: 1, name: 'john', score: 20, isOnline: false, status: 'active', createdAt: '2024-12-01' },
      { id: 3, name: 'tom', score: 40, isOnline: false, status: 'inactive', createdAt: '2024-12-02' },
      { id: 5, name: 'bruce', score: 50, isOnline: true, status: 'active', createdAt: '2024-12-05' }
    ]);
  });

  it('should return matching entries by and or', () => {
    const result =
      filter(data, {
        [Op.and]: [
          { status: 'active' },
          {
            [Op.or]: [
              { name: 'john' },
              { score: { [Op.gte]: 40 } }
            ]
          }
        ]
      });
    expect(result).toStrictEqual([
      { id: 1, name: 'john', score: 20, isOnline: false, status: 'active', createdAt: '2024-12-01' },
      { id: 5, name: 'bruce', score: 50, isOnline: true, status: 'active', createdAt: '2024-12-05' }
    ]);
  });
});