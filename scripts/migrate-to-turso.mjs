/**
 * Migration script: Export local SQLite → Turso cloud
 * Run: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/migrate-to-turso.mjs
 */
import { createClient } from '@libsql/client';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
    console.error('❌ Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env variables first!');
    process.exit(1);
}

const localDbPath = join(__dirname, '../sil.db');
const localDb = new sqlite3.Database(localDbPath);

const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

const dbAll = (db, sql) => new Promise((res, rej) => db.all(sql, [], (err, rows) => err ? rej(err) : res(rows)));

async function migrateTable(tableName) {
    const rows = await dbAll(localDb, `SELECT * FROM ${tableName}`);
    if (rows.length === 0) {
        console.log(`  ⏭ ${tableName}: kosong`);
        return;
    }

    // Get columns
    const cols = Object.keys(rows[0]);
    const placeholders = cols.map(() => '?').join(', ');
    const sql = `INSERT OR REPLACE INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders})`;

    let count = 0;
    for (const row of rows) {
        await turso.execute({ sql, args: Object.values(row) });
        count++;
    }
    console.log(`  ✅ ${tableName}: ${count} baris dimigrasikan`);
}

async function main() {
    console.log('🚀 Memulai migrasi ke Turso...\n');

    // Get all tables from local SQLite
    const tables = await dbAll(localDb, `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`);
    
    // First: get and execute schema from local SQLite
    console.log('📐 Membuat skema di Turso...');
    for (const { name } of tables) {
        const [{ sql }] = await dbAll(localDb, `SELECT sql FROM sqlite_master WHERE type='table' AND name='${name}'`);
        if (sql) {
            try {
                await turso.execute(sql.replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS'));
                console.log(`  ✅ Tabel ${name} siap`);
            } catch (e) {
                console.log(`  ⚠ ${name}: ${e.message}`);
            }
        }
    }

    console.log('\n📦 Migrasi data...');
    
    // Disable FK checks for bulk insert
    await turso.execute('PRAGMA foreign_keys = OFF');
    
    const tableOrder = ['users', 'laboratories', 'courses', 'classes', 'inventory', 'loans', 'materials', 'topics', 'quiz_questions', 'quiz_results', 'flashcard_progress', 'worksheets', 'audit_logs', 'support_tickets', 'settings', 'media_files'];
    
    for (const table of tableOrder) {
        if (tables.find(t => t.name === table)) {
            await migrateTable(table);
        }
    }

    // Migrate remaining tables
    for (const { name } of tables) {
        if (!tableOrder.includes(name)) {
            await migrateTable(name);
        }
    }
    
    // Re-enable FK checks
    await turso.execute('PRAGMA foreign_keys = ON');


    console.log('\n🎉 Migrasi selesai!');
    localDb.close();
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
