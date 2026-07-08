const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('../sil.db');
db.serialize(() => {
    db.run(`UPDATE inventory SET image_url = 'https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' WHERE name LIKE '%Biological Indicator%'`);
    db.run(`UPDATE inventory SET image_url = 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' WHERE name LIKE '%Microscope%'`);
    db.run(`UPDATE inventory SET image_url = 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' WHERE name LIKE '%Camera%'`);
    db.run(`UPDATE inventory SET image_url = 'https://images.unsplash.com/photo-1532187863486-abf9db0c28a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' WHERE name LIKE '%Kit%'`);
    db.run(`UPDATE inventory SET image_url = 'https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' WHERE name LIKE '%Mix%'`);
});
db.close();
