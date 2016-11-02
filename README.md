# simpledbi
A simple Database Interface using TypeScript annotations.

The goal is to write raw SQL (no ORM) and have SQL queries bound to a function execution. It is heavily inspired from [JDBI](http://jdbi.org/)

To use it, you should use one of the real database bindings such as `simpledbi-sqlite3`
(currently, it's the only binding available BTW, PR are welcome).

## Currenly at the stage of a prototype - comments welcome!

# Example

Here is what an access layer looks like.

```TypeScript
class LoremDao implements SqlProxy {
    constructor(public database: DatabaseAdapter) { }

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

```
