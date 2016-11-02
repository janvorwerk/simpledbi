# simpledbi-sqlite3
A binding of `simpledbi` for `sqlite3`

The goal is to write SQL (no ORM) and have SQL queries bound to a function execution. 

# Example

It is as simple as that...

```TypeScript
import { Database } from 'sqlite3';
import { SqlProxy, DatabaseAdapter, SqlRunResult,
         SqlQuery, SqlRun, SqlScript, SqlGet
    } from 'simpledbi/simpledbi';

import { Sqlite3DatabaseAdapter } from 'simpledbi-sqlite3/simpledbi-sqlite3';

const dbAdapter = new Sqlite3DatabaseAdapter(new Database('./test.db'));

interface LoremRecord {
    id: number;
    info: string;
}

class LoremDao implements SqlProxy {
    constructor(public database: DatabaseAdapter) { }

    @SqlRun(`
        BEGIN TRANSACTION
    `)
    begin(): Promise<SqlRunResult> { throw '' }

    @SqlRun(`
        COMMIT TRANSACTION
    `)
    commit(): Promise<SqlRunResult> { throw '' }

    @SqlScript(`
        DROP TABLE IF EXISTS lorem;
        CREATE TABLE lorem (id NUMBER, info TEXT);
    `)
    createTable(): Promise<SqlRunResult> { throw '' }

    @SqlRun(`
        INSERT INTO lorem (id, info)
        VALUES ($id, $info)
    `)
    insert(id: number, info: string): Promise<SqlRunResult> { throw '' }

    @SqlGet(`
        SELECT id, info
        FROM lorem
        WHERE id = $id
    `)
    getById(id: number): Promise<LoremRecord> { throw '' }

    @SqlQuery(`
        SELECT id, info
        FROM lorem
    `)
    getAll(): Promise<LoremRecord[]> { throw '' }
}

const dao = new LoremDao(dbAdapter);

async function runAll() {

    // Create table
    await dao.createTable();

    // Insert data
    await dao.begin(); // transaction supported
    for (let i = 1; i <= 10000; i++) {
        let r: SqlRunResult = await dao.insert(i, `lorem ${i}`);
        console.log(`created entry ${JSON.stringify(r)}`);
    }
    await dao.commit();

    // Fetch one value
    let val: LoremRecord = await dao.getById(6);
    console.log(`Got #6: ${JSON.stringify(val)}`);

    // Fetch all values
    const allEntries: LoremRecord[] = await dao.getAll();
    console.log(`Found ${allEntries.length} entries`);
}
runAll();

```
