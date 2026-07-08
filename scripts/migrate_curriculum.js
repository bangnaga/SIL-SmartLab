import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../sil.db');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Create class_topics
    db.run(`
        CREATE TABLE IF NOT EXISTS class_topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            order_index INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(class_id) REFERENCES classes(id)
        )
    `, (err) => {
        if (err) console.error("Error creating class_topics:", err);
        else console.log("Created class_topics table");
    });

    // 2. Alter learning_materials (if columns don't exist)
    const addColumn = (table, column, def) => {
        db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`, (err) => {
            if (err && !err.message.includes("duplicate column name")) {
                console.error(`Error adding ${column} to ${table}:`, err.message);
            } else {
                console.log(`Added ${column} to ${table} (or already exists)`);
            }
        });
    };

    addColumn('learning_materials', 'class_id', 'INTEGER');
    addColumn('learning_materials', 'topic_id', 'INTEGER');
    addColumn('learning_materials', 'order_index', 'INTEGER DEFAULT 0');
    addColumn('learning_materials', 'content', 'TEXT'); // Store JSON for quizzes/flashcards
    addColumn('learning_materials', 'is_prerequisite', 'INTEGER DEFAULT 0');

    // Re-check schema at the end
    setTimeout(() => {
        console.log("Database update complete.");
        db.close();
    }, 1000);
});
