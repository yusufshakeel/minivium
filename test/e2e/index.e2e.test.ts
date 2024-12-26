import path from 'path';
import { minivium, SchemaRegistry } from '../../src';
import { MiniviumType } from '../../src/types/minivium';

describe('minivium', () => {
  const dataDir = path.resolve(process.cwd(), './output');
  const schemaRegistry = new SchemaRegistry({
    collections: [
      {
        name: 'users-e2e',
        columns: [
          { name: 'username', isRequired: true },
          { name: 'email', isRequired: true },
          { name: 'phoneNumber' }
        ]
      },
      {
        name: 'posts-e2e',
        columns: [
          { name: 'userId', isRequired: true },
          { name: 'content', isRequired: true },
          { name: 'createdAt', isRequired: true }
        ]
      }
    ]
  });

  let db: MiniviumType;

  beforeEach(() => {
    db = minivium({ dataDir, schemaRegistry });
    db.init();
  });

  it('should be able to initialise collections', () => {
    expect(db.query.select('users-e2e')).toStrictEqual([]);
    expect(db.query.select('posts-e2e')).toStrictEqual([]);
  });

  it('should be able to insert, update, select and delete data', () => {
    const beforeContent = db.query.select('users-e2e');

    const id = db.query.insert('users-e2e', {
      username: 'yusufshakeel',
      email: 'yusufshakeel@example.com',
      phoneNumber: '123'
    });

    const selectedById = db.query.select('users-e2e', { where: { id } });

    const updatedRowCount = db.query.update(
      'users-e2e',
      { phoneNumber: '1234' },
      { where: { id } }
    );

    const selectedRowAfterUpdate = db.query.select('users-e2e', { where: { id } });

    const deletedRowCount = db.query.delete('users-e2e', { where: { id } });

    const selectedRowAfterDelete = db.query.select('users-e2e', { where: { id } });

    expect(beforeContent).toStrictEqual([]);
    expect(selectedById).toStrictEqual([{
      id,
      username: 'yusufshakeel',
      email: 'yusufshakeel@example.com',
      phoneNumber: '123'
    }]);
    expect(updatedRowCount).toBe(1);
    expect(selectedRowAfterUpdate).toStrictEqual([{
      id,
      username: 'yusufshakeel',
      email: 'yusufshakeel@example.com',
      phoneNumber: '1234'
    }]);
    expect(deletedRowCount).toBe(1);
    expect(selectedRowAfterDelete).toStrictEqual([]);
  });
});