const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Kết nối đến MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// Thêm kho mới lấy ID  sản phảm từ bảng sản phẩm để thêm vào kho
router.post('/kho', async (req, res) => {
    const { SanPhamId, SoLuong, DiaDiem } = req.body;

    try {
        const [results] = await pool.query(
            'INSERT INTO Kho (SanPhamId, SoLuong, DiaDiem) VALUES (?, ?, ?)',
            [SanPhamId, SoLuong, DiaDiem]
        );
        res.status(201).json({ message: 'Kho đã được thêm thành công!', khoId: results.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Hiển thị tất cả kho
router.get('/kho', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM Kho');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cập nhật kho
router.put('/kho/:id', async (req, res) => {
    const { id } = req.params;
    const { SoLuong, DiaDiem } = req.body;

    try {
        const [results] = await pool.query(
            'UPDATE Kho SET SoLuong = ?, DiaDiem = ? WHERE KhoId = ?',
            [SoLuong, DiaDiem, id]
        );
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Kho không tồn tại.' });
        }
        res.json({ message: 'Kho đã được cập nhật thành công!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Xóa kho
router.delete('/kho/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await pool.query(
            'DELETE FROM Kho WHERE KhoId = ?',
            [id]
        );
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Kho không tồn tại.' });
        }
        res.json({ message: 'Kho đã được xóa thành công!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
