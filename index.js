const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// ✅ Agar Express bisa membaca JSON dari frontend
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Menyajikan folder public sebagai file statis
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Koneksi ke MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  port: '3307',
  password: 'syafrina416',
  database: 'pws'
});

// ✅ Cek koneksi MySQL
db.connect(err => {
  if (err) {
    console.error("❌ Gagal konek ke MySQL:", err);
    return;
  }
  console.log("✅ Terhubung ke MySQL!");
});

// ✅ Route utama menampilkan HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ POST — Generate API Key & simpan ke database
app.post('/create', (req, res) => {
  const { name } = req.body;  // ✅ Ambil name dari body

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "name wajib diisi"
    });
  }

  // ✅ Generate API Key
  const raw = crypto.randomBytes(32).toString('hex');
  const apiKey = raw.match(/.{1,8}/g).join('-');

  // ✅ Simpan ke database
  const sql = "INSERT INTO api_keys (name, api_key) VALUES (?, ?)";
  db.query(sql, [name, apiKey], (err, result) => {
    if (err) {
      console.error("❌ Error insert:", err);
      return res.status(500).json({
        success: false,
        message: "Gagal menyimpan ke database"
      });
    }

    res.json({
      success: true,
      message: "API Key berhasil dibuat dan disimpan ke database!",
      data: {
        id: result.insertId,
        name,
        apiKey
      }
    });
  });
});

// ✅ GET — Ambil semua API Key (untuk Postman)
app.get('/api/keys', (req, res) => {
  const sql = "SELECT * FROM api_keys ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.log("❌ Error ambil data:", err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data"
      });
    }

    res.json({
      success: true,
      total: results.length,
      data: results
    });
  });
});

// ✅ Jalankan server
app.listen(port, () => {
  console.log(`✅ Server berjalan di http://localhost:${port}`);
});
