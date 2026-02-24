import postgres from 'postgres';

const sql = (global as any).postgres || postgres(process.env.DATABASE_URL!, {
    ssl: 'require',
    idle_timeout: 20,
    max_lifetime: 60 * 30
});

if (process.env.NODE_ENV !== 'production') {
    (global as any).postgres = sql;
}

export default sql;
