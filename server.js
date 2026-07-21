import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

import sqlite3 from 'sqlite3';
const db = new sqlite3.Database(path.join(__dirname, 'gifts.db'));

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS gifts (id TEXT PRIMARY KEY, data TEXT)");
});

app.post('/api/gifts', (req, res) => {
  const { id, data } = req.body;
  if (!id || !data) {
    return res.status(400).json({ error: 'Missing id or data' });
  }
  
  const stmt = db.prepare("INSERT OR REPLACE INTO gifts (id, data) VALUES (?, ?)");
  stmt.run(id, JSON.stringify(data), (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, id });
  });
  stmt.finalize();
});

app.get('/api/gifts/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT data FROM gifts WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Gift not found' });
    }
    try {
      res.json(JSON.parse(row.data));
    } catch (e) {
      res.status(500).json({ error: 'Invalid data format in database' });
    }
  });
});

app.get('/api/db/download', (req, res) => {
  const dbPath = path.join(__dirname, 'gifts.db');
  res.download(dbPath, 'gifts.sqlite');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
