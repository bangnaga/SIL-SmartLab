import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('../sil.db');

const newInventory = [
    // MesaLabs (Mikrobiologi)
    {
        name: 'EZTest Biological Indicator',
        category: 'Mikrobiologi',
        stock: 50,
        unit: 'Box',
        description: 'MesaLabs EZTest Steam Biological Indicator for validating sterilization.',
        image_url: 'https://bjscientific.co.id/wp-content/uploads/2023/09/eztest.jpg'
    },
    {
        name: 'MagnaAmp Biological Indicator',
        category: 'Mikrobiologi',
        stock: 20,
        unit: 'Box',
        description: 'MesaLabs MagnaAmp for monitoring sterilization of liquids.',
        image_url: 'https://bjscientific.co.id/wp-content/uploads/2023/09/magnaamp.jpg'
    },
    
    // Olympus (Patologi-Sitologi)
    {
        name: 'Olympus CX23 Microscope',
        category: 'Patologi-Sitologi',
        stock: 5,
        unit: 'Unit',
        description: 'Olympus CX23 Upright Biological Microscope for educational and clinical routine.',
        image_url: 'https://bjscientific.co.id/wp-content/uploads/2023/10/CX23.jpg'
    },
    {
        name: 'Olympus DP27 Digital Camera',
        category: 'Patologi-Sitologi',
        stock: 2,
        unit: 'Unit',
        description: 'Olympus DP27 5-Megapixel Digital Microscope Camera.',
        image_url: 'https://bjscientific.co.id/wp-content/uploads/2023/10/DP27.jpg'
    },

    // Firegene (Mikrobiologi)
    {
        name: 'Firegene DNA Extraction Kit',
        category: 'Mikrobiologi',
        stock: 15,
        unit: 'Kit',
        description: 'Firegene rapid genomic DNA extraction kit.',
        image_url: 'https://bjscientific.co.id/wp-content/uploads/2023/08/dna-extraction.jpg'
    },
    {
        name: 'Firegene PCR Master Mix (2x)',
        category: 'Mikrobiologi',
        stock: 30,
        unit: 'Tube',
        description: 'Firegene Taq PCR Master Mix for routine PCR applications.',
        image_url: 'https://bjscientific.co.id/wp-content/uploads/2023/08/pcr-master-mix.jpg'
    },

    // Laboratorium Komputer
    {
        name: 'PC Desktop Core i7',
        category: 'Laboratorium Komputer',
        stock: 30,
        unit: 'Unit',
        description: 'PC Desktop Intel Core i7, 16GB RAM, 512GB NVMe SSD.',
        image_url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
        name: 'Monitor LED 24 Inch',
        category: 'Laboratorium Komputer',
        stock: 32,
        unit: 'Unit',
        description: 'Monitor LED 24 Inch IPS Panel FHD.',
        image_url: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
        name: 'Logitech Wireless Keyboard & Mouse',
        category: 'Laboratorium Komputer',
        stock: 35,
        unit: 'Set',
        description: 'Logitech Wireless Combo Keyboard and Mouse MK240.',
        image_url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
        name: 'Cisco 24-Port Gigabit Switch',
        category: 'Laboratorium Komputer',
        stock: 2,
        unit: 'Unit',
        description: 'Cisco Catalyst 24-Port Gigabit Ethernet Switch.',
        image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
        name: 'UPS APC 1000VA',
        category: 'Laboratorium Komputer',
        stock: 10,
        unit: 'Unit',
        description: 'APC Back-UPS 1000VA with Battery Backup.',
        image_url: 'https://images.unsplash.com/photo-1584981152203-75b2829141cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }
];

db.serialize(() => {
    const stmt = db.prepare(`
        INSERT INTO inventory (type, name, category, stock, unit, lab_id, min_stock, description, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Assume lab_id 1 is for general labs, maybe we can query it or just insert 1
    // Let's query a lab_id first to be safe, or just leave it NULL if allowed.
    // The schema says lab_id INTEGER, it allows NULL. Let's use 1 for science and 2 for computer if exists, else 1.

    newInventory.forEach(item => {
        // type is 'alat' or 'bahan'
        const type = item.category === 'Mikrobiologi' && item.name.includes('Mix') ? 'bahan' : 'alat';
        
        stmt.run(
            type,
            item.name,
            item.category,
            item.stock,
            item.unit,
            1, // lab_id default to 1
            5, // min_stock
            item.description,
            item.image_url
        );
    });

    stmt.finalize();
    console.log("Inserted new inventory items successfully!");
});

db.close();
