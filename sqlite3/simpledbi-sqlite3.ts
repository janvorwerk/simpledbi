import { Database } from 'sqlite3';
import { DatabaseAdapter, SqlRunResult, SqlOptions } from 'simpledbi/simpledbi';

/**
 * The SQlite adapter (using the 'sqlite3' NPM package)
 */
export class Sqlite3DatabaseAdapter extends DatabaseAdapter {

    constructor(public db: Database) { super() }

    query<T>(query: string, params: any, options: SqlOptions): Promise<T> {
        return new Promise((resolve, reject) => {
            let cb = (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            };
            if (options.kind === 'multi')
                this.db.all(query, params, cb);
            else if (options.kind === 'single')
                this.db.get(query, params, cb);
            else
                throw `unsupported option: ${options.kind}`;

        });
    }
    run(query: string, params: any, options: SqlOptions): Promise<SqlRunResult> {
        return new Promise((resolve, reject) => {
            let cb = function (error) {
                if (error)
                    reject(error)
                else
                    resolve({ id: this.lastID, rowcount: this.changes });
            };
            if (options.kind === 'multi')
                this.db.exec(query, cb);
            else if (options.kind === 'single')
                this.db.run(query, params, cb);
            else
                throw `Unsupported option: ${options.kind}`;
        });
    }
}
