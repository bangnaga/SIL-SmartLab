const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../sil.db');
const db = new sqlite3.Database(dbPath);

const table = process.argv[2] || 'users';

console.log(`Querying table: ${table}`);

db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.table(rows);
});

db.close();
