// routes/loaiSanPhamRoutes.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Kết nối đến MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Thêm loại sản phẩm
router.post('/loaisanpham', (req, res) => {
    const { TenLoai } = req.body;

    // Kiểm tra tên loại sản phẩm đã tồn tại
    pool.query('SELECT * FROM LoaiSanPham WHERE TenLoai = ?', [TenLoai], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'Tên loại sản phẩm đã tồn tại.' });
        }

        // Nếu tên loại không tồn tại, thực hiện thêm loại sản phẩm mới
        pool.query('INSERT INTO LoaiSanPham (TenLoai) VALUES (?)', [TenLoai], (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            res.status(201).json({ message: 'Loại sản phẩm đã được tạo thành công!', loaiSanPhamId: results.insertId });
        });
    });
});

// Lấy tất cả loại sản phẩm
router.get('/loaisanpham', (req, res) => {
    pool.query('SELECT * FROM LoaiSanPham', (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
});

// Cập nhật loại sản phẩm
router.put('/loaisanpham/:id', (req, res) => {
    const { id } = req.params;
    const { TenLoai } = req.body;

    // Kiểm tra tên loại sản phẩm mới đã tồn tại chưa
    pool.query('SELECT * FROM LoaiSanPham WHERE TenLoai = ? AND LoaiSanPhamId != ?', [TenLoai, id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'Tên loại sản phẩm đã tồn tại.' });
        }

        // Cập nhật loại sản phẩm
        pool.query('UPDATE LoaiSanPham SET TenLoai = ? WHERE LoaiSanPhamId = ?', [TenLoai, id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Loại sản phẩm không tồn tại.' });
            }
            res.json({ message: 'Loại sản phẩm đã được cập nhật thành công!' });
        });
    });
});

// Xóa loại sản phẩm
router.delete('/loaisanpham/:id', (req, res) => {
    const { id } = req.params;

    pool.query('DELETE FROM LoaiSanPham WHERE LoaiSanPhamId = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Loại sản phẩm không tồn tại.' });
        }
        res.json({ message: 'Loại sản phẩm đã được xóa thành công!' });
    });
});

module.exports = router;
