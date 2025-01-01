import path from 'path';
import { minivium, SchemaRegistry, Op } from '../../src';
import { MiniviumType } from '../../src/types/minivium';

describe('minivium', () => {
  const dataDir = path.resolve(process.cwd(), './output');

  const assertions = (data: any) => {
    const {
      postContent,
      beforeContent,
      selectedById,
      id,
      ids,
      selectedByIds,
      updatedRowCount,
      selectedRowAfterUpdate,
      deletedRowCount,
      selectedRowAfterDelete
    } = data;

    expect(postContent).toStrictEqual([]);
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
  };

  const getSchemaRegistryInstance = (
    usersCollectionName: string, postsCollectionName: string
  ) => {
    return new SchemaRegistry({
      collections: [
        {
          name: usersCollectionName,
          columns: [
            { name: 'username', isRequired: true },
            { name: 'email', isRequired: true },
            { name: 'phoneNumber' }
          ]
        },
        {
          name: postsCollectionName,
          columns: [
            { name: 'userId', isRequired: true },
            { name: 'content', isRequired: true },
            { name: 'createdAt', isRequired: true }
          ]
        }
      ]
    });
  };

  it('end-to-end test - Sync methods', () => {
    const users = 'users-e2e';
    const posts = 'posts-e2e';

    const schemaRegistry = getSchemaRegistryInstance(users, posts);

    const db: MiniviumType = minivium({ dataDir, schemaRegistry });

    // initialise the collections if not exists
    db.init();

    const beforeContent = db.query.select(users);

    const id = db.query.insert(users, {
      username: 'yusufshakeel',
      email: 'yusufshakeel@example.com',
      phoneNumber: '123'
    });

    const ids = db.query.bulkInsert(users, [
      { username: 'john', email: 'john@example.com' },
      { username: 'jane', email: 'jane@example.com' }
    ]);

    const selectedById = db.query.select(users, { where: { id } });
    const selectedByIds = db.query.select(users, { where: { id: { [Op.in]: ids } } });

    const updatedRowCount = db.query.update(
      users,
      { phoneNumber: '1234' },
      { where: { id } }
    );

    // this should not re-create the collections because they are already created
    db.init();

    const selectedRowAfterUpdate = db.query.select(users, { where: { id } });

    const deletedRowCount = db.query.delete(users, { where: { id } });

    const selectedRowAfterDelete = db.query.select(
      users,
      { where: { id: { [Op.eq]: id } } }
    );

    const postContent = db.query.select(posts);

    assertions({
      postContent,
      beforeContent,
      selectedById,
      id,
      ids,
      selectedByIds,
      updatedRowCount,
      selectedRowAfterUpdate,
      deletedRowCount,
      selectedRowAfterDelete
    });

    db.dropAllCollections();
  });

  it('end-to-end test - Async methods', async () => {
    const users = 'users-e2e-async';
    const posts = 'posts-e2e-async';

    const schemaRegistry = getSchemaRegistryInstance(users, posts);

    const db: MiniviumType = minivium({ dataDir, schemaRegistry });

    // initialise the collections if not exists
    await db.initAsync();

    const beforeContent = await db.query.selectAsync(users);

    const id = await db.query.insertAsync(users, {
      username: 'yusufshakeel',
      email: 'yusufshakeel@example.com',
      phoneNumber: '123'
    });

    const ids = await db.query.bulkInsertAsync(users, [
      { username: 'john', email: 'john@example.com' },
      { username: 'jane', email: 'jane@example.com' }
    ]);

    const selectedById = await db.query.selectAsync(users, { where: { id } });
    const selectedByIds = await db.query.selectAsync(users, { where: { id: { [Op.in]: ids } } });

    const updatedRowCount = await db.query.updateAsync(
      users,
      { phoneNumber: '1234' },
      { where: { id } }
    );

    // this should not re-create the collections because they are already created
    await db.initAsync();

    const selectedRowAfterUpdate = await db.query.selectAsync(users, { where: { id } });

    const deletedRowCount = await db.query.deleteAsync(users, { where: { id } });

    const selectedRowAfterDelete = await db.query.selectAsync(
      users,
      { where: { id: { [Op.eq]: id } } }
    );

    const postContent = await db.query.selectAsync(posts);

    assertions({
      postContent,
      beforeContent,
      selectedById,
      id,
      ids,
      selectedByIds,
      updatedRowCount,
      selectedRowAfterUpdate,
      deletedRowCount,
      selectedRowAfterDelete
    });

    await db.dropAllCollectionsAsync();
  });
});