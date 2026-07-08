import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../sil.db');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS material_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            material_id INTEGER NOT NULL,
            class_id INTEGER NOT NULL,
            submission_text TEXT,
            file_url TEXT,
            grade REAL,
            feedback TEXT,
            status TEXT DEFAULT 'submitted',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(student_id) REFERENCES users(id),
            FOREIGN KEY(material_id) REFERENCES learning_materials(id),
            FOREIGN KEY(class_id) REFERENCES classes(id)
        )
    `, (err) => {
        if (err) console.error("Error creating material_submissions:", err);
        else console.log("Created material_submissions table");
    });

    setTimeout(() => {
        db.close();
    }, 1000);
});
