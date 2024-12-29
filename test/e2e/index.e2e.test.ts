import path from 'path';
import { minivium, SchemaRegistry, Op } from '../../src';
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

  const db: MiniviumType = minivium({ dataDir, schemaRegistry });

  it('end-to-end test', () => {
    // initialise the collections if not exists
    db.init();

    const beforeContent = db.query.select('users-e2e');

    const id = db.query.insert('users-e2e', {
      username: 'yusufshakeel',
      email: 'yusufshakeel@example.com',
      phoneNumber: '123'
    });

    const ids = db.query.bulkInsert('users-e2e', [
      { username: 'john', email: 'john@example.com' },
      { username: 'jane', email: 'jane@example.com' }
    ]);

    const selectedById = db.query.select('users-e2e', { where: { id } });
    const selectedByIds = db.query.select('users-e2e', { where: { id: { [Op.in]: ids } } });

    const updatedRowCount = db.query.update(
      'users-e2e',
      { phoneNumber: '1234' },
      { where: { id } }
    );

    // this should not re-create the collections because they are already created
    db.init();

    const selectedRowAfterUpdate = db.query.select('users-e2e', { where: { id } });

    const deletedRowCount = db.query.delete('users-e2e', { where: { id } });

    const selectedRowAfterDelete = db.query.select(
      'users-e2e',
      { where: { id: { [Op.eq]: id } } }
    );

    expect(db.query.select('posts-e2e')).toStrictEqual([]);
    expect(beforeContent).toStrictEqual([]);
    expect(selectedById).toStrictEqual([{
      id,
      username: 'yusufshakeel',
      email: 'yusufshakeel@example.com',
      phoneNumber: '123'
    }]);
    expect(selectedByIds).toStrictEqual([
      { id: ids[0], username: 'john', email: 'john@example.com' },
      { id: ids[1], username: 'jane', email: 'jane@example.com' }
    ]);
    expect(updatedRowCount).toBe(1);
    expect(selectedRowAfterUpdate).toStrictEqual([{
      id,
      username: 'yusufshakeel',
      email: 'yusufshakeel@example.com',
      phoneNumber: '1234'
    }]);
    expect(deletedRowCount).toBe(1);
    expect(selectedRowAfterDelete).toStrictEqual([]);

    // drop all the collections
    db.dropAllCollections();
  });
});