import { Database } from 'sqlite3';
import { SqlQuery, SqlProxy, DatabaseAdapter, SqlRun, SqlRunResult, SqlScript, SqlGet } from 'simpledbi/simpledbi';

import { Sqlite3QueryAdapter } from './simpledbi-sqlite3';

const measureTime = require('measure-time');

const dbAdapter = new Sqlite3QueryAdapter(new Database('./test.db'));

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
    await dao.createTable();

    let timer: any;

    // Insert data
    timer = measureTime();
    await dao.begin();
    for (let i = 1; i <= 10000; i++) {
        let r: SqlRunResult = await dao.insert(i, `lorem ${i}`);
        //console.log(`created entry ${JSON.stringify(r)}`);
    }
    await dao.commit();
    console.log(`Sequential insertion lasted: ${JSON.stringify(timer())}`);

    // Insert data in parallel
    timer = measureTime();
    await dao.begin();
    const tmp: Array<Promise<SqlRunResult>> = [];
    for (let i = 10001; i <= 20000; i++) {
        tmp.push(dao.insert(i, `lorem ${i}`));
    }
    await Promise.all(tmp);
    await dao.commit();
    console.log(`Parallel insertion lasted: ${JSON.stringify(timer())}`);

    // Fetch one value
    timer = measureTime();
    let val: LoremRecord = await dao.getById(6);
    console.log(`Got #6: ${JSON.stringify(val)} in ${JSON.stringify(timer())}`);

    // Fetch all values
    timer = measureTime();
    const allEntries: LoremRecord[] = await dao.getAll();
    console.log(`Found ${allEntries.length} entries in ${JSON.stringify(timer())}`);
}
runAll();
