const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database');
});

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      department TEXT NOT NULL,
      priority TEXT DEFAULT 'Normal',
      status TEXT DEFAULT 'Pending',
      requested_by TEXT,
      requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      fulfilled_at DATETIME,
      FOREIGN KEY (item_id) REFERENCES inventory_items(id)
    )
  `);

  // Seed initial inventory if empty
  db.get('SELECT COUNT(*) as count FROM inventory_items', (err, row) => {
    if (row.count === 0) {
      const items = [
        { name: 'Blankets', category: 'Bedding' },
        { name: 'Pillows', category: 'Bedding' },
        { name: 'Sheets', category: 'Bedding' },
        { name: 'Towels', category: 'Linens' },
        { name: 'Bandages', category: 'Medical Supplies' },
        { name: 'Gauze Pads', category: 'Medical Supplies' },
        { name: 'Syringes', category: 'Medical Supplies' },
        { name: 'IV Bags', category: 'Medical Supplies' },
        { name: 'Face Masks', category: 'PPE' },
        { name: 'Gloves', category: 'PPE' },
        { name: 'Hand Sanitizer', category: 'Hygiene' },
        { name: 'Soap', category: 'Hygiene' },
      ];

      const stmt = db.prepare('INSERT INTO inventory_items (name, category) VALUES (?, ?)');
      items.forEach(item => stmt.run(item.name, item.category));
      stmt.finalize();
      console.log('Database seeded with initial inventory');
    }
  });
});

// Routes

// GET all inventory items
app.get('/api/items', (req, res) => {
  db.all('SELECT * FROM inventory_items ORDER BY category, name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// POST a new request
app.post('/api/requests', (req, res) => {
  const { item_id, item_name, quantity, department, priority, requested_by } = req.body;

  if (!item_name || !quantity || !department) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Look up item_id if not provided
  if (item_id) {
    insertRequest(item_id, item_name, quantity, department, priority, requested_by, res);
  } else {
    // Find item by name
    db.get('SELECT id FROM inventory_items WHERE name = ?', [item_name], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const foundItemId = row ? row.id : null;
      insertRequest(foundItemId, item_name, quantity, department, priority, requested_by, res);
    });
  }
});

function insertRequest(item_id, item_name, quantity, department, priority, requested_by, res) {
  const query = `
    INSERT INTO requests (item_id, item_name, quantity, department, priority, requested_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [item_id, item_name, quantity, department, priority || 'Normal', requested_by || 'Anonymous'], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: this.lastID, message: 'Request created successfully' });
    }
  });
}

// GET all requests
app.get('/api/requests', (req, res) => {
  const query = `
    SELECT * FROM requests
    ORDER BY
      CASE status
        WHEN 'Pending' THEN 1
        WHEN 'In Progress' THEN 2
        WHEN 'Fulfilled' THEN 3
      END,
      CASE priority
        WHEN 'Urgent' THEN 1
        WHEN 'High' THEN 2
        WHEN 'Normal' THEN 3
        WHEN 'Low' THEN 4
      END,
      requested_at DESC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// UPDATE request status
app.put('/api/requests/:id', (req, res) => {
  const { status } = req.body;
  const fulfilled_at = status === 'Fulfilled' ? new Date().toISOString() : null;

  const query = `UPDATE requests SET status = ?, fulfilled_at = ? WHERE id = ?`;

  db.run(query, [status, fulfilled_at, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Request updated successfully' });
    }
  });
});

// DELETE request
app.delete('/api/requests/:id', (req, res) => {
  const query = `DELETE FROM requests WHERE id = ?`;

  db.run(query, req.params.id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Request deleted successfully' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) console.error(err.message);
    console.log('Database connection closed');
    process.exit(0);
  });
});
