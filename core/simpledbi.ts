const functionArgs = require('function-arguments');

/**
 * A database adapter is used to abstract away from the database implementation
 */
export class DatabaseAdapter {
    query<T>(query: string, params: any, options: SqlOptions): PromiseLike<T> {
        throw 'NotImplemented';
    }
    run(query: string, params: any, options: SqlOptions): PromiseLike<SqlRunResult> {
        throw 'NotImplemented';
    }
}

/**
 * An SQL proxy is required to provide the database property
 */
export interface SqlProxy {
    database: DatabaseAdapter;
}

/**
 * Any option (expandable in the future...)
 */
export interface SqlOptions {
    kind?: 'single' | 'multi';
}

/**
 * Any non-SELECT (UPDATE, INSERT and DELETE and DDL statements)
 * do not return data but will return this type of data
 */
export interface SqlRunResult {
    rowcount?: number
    id?: any
}

/**
 * Builds the query parameters
 */
function buildQueryParams(paramNames: string[], paramValues: any[]) {
    const queryParams = {};
    for (let i = 0; i < paramNames.length; i++) {
        queryParams[`$${paramNames[i]}`] = paramValues[i];
    }
    return queryParams;
}

/**
 * Implementation for the single/multiple query annotations
 */
function queryAnnotation(query: string, options: SqlOptions = {}) {
    return function (target: SqlProxy, key: string, descriptor: any) {
        const paramNames: string[] = functionArgs(descriptor.value);

        descriptor.value = function <T>(...args: any[]): PromiseLike<T> {
            const queryParams = buildQueryParams(paramNames, args);
            const me: SqlProxy = this; // type checks
            return me.database.query(query, queryParams, options);
        }
        return descriptor;
    }
}

/**
 * Implementation the single/multiple run/script annotations
 */
function execAnnotation(query: string, options: SqlOptions = {}) {
    return function (target: SqlProxy, key: string, descriptor: any) {
        const paramNames: string[] = functionArgs(descriptor.value);

        descriptor.value = function (...args: any[]): PromiseLike<SqlRunResult> {
            const queryParams = buildQueryParams(paramNames, args);
            const me: SqlProxy = this; // type checks
            return me.database.run(query, queryParams, options);
        }
        return descriptor;
    }
}
/**
 * Annotation for an SQL SELECT query returning a single value
 */
export function SqlGet(query: string, options: SqlOptions = {}) {
    options.kind = 'single';
    return queryAnnotation(query, options);
}

/**
 * Annotation for an SQL SELECT query returning multiple values
 */
export function SqlQuery(query: string, options: SqlOptions = {}) {
    options.kind = 'multi';
    return queryAnnotation(query, options);
}

/**
 * Annotation for a single SQL non-SELECT statements
 * (such as UPDATE, INSERT and DELETE and DDL statements)
 */
export function SqlRun(query: string, options: SqlOptions = {}) {
    options.kind = 'single';
    return execAnnotation(query, options);
}

/**
 * Annotation for an SQL script made out of multiple statements
 */
export function SqlScript(query: string, options: SqlOptions = {}) {
    options.kind = 'multi';
    return execAnnotation(query, options);
}
