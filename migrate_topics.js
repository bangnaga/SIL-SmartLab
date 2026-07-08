import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'sil.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        process.exit(1);
    }
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this); });
});

async function migrate() {
    try {
        console.log("Checking class_topics schema...");
        await run("ALTER TABLE class_topics ADD COLUMN course_id INTEGER");
        console.log("Added course_id to class_topics successfully.");
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log("Column course_id already exists in class_topics.");
        } else {
            console.error("Error adding course_id to class_topics:", err.message);
        }
    }
    
    db.close();
}

migrate();
