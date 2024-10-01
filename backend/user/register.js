// routes/userRoutes.js
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

// Route: Đăng ký người dùng
router.post('/register', (req, res) => {
    const { TenDangNhap, MatKhau, Email, DiaChi, SoDienThoai } = req.body;

    // Kiểm tra tên đăng nhập và email có tồn tại hay không
    const checkQuery = 'SELECT * FROM NguoiDung WHERE TenDangNhap = ? OR Email = ?';
    pool.query(checkQuery, [TenDangNhap, Email], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc email đã tồn tại.' });
        }

        // Nếu không tồn tại, thêm người dùng mới
        const insertQuery = 'INSERT INTO NguoiDung (TenDangNhap, MatKhau, Email, DiaChi, SoDienThoai) VALUES (?, ?, ?, ?, ?)';
        pool.query(insertQuery, [TenDangNhap, MatKhau, Email, DiaChi, SoDienThoai], (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            res.status(201).json({ message: 'Người dùng đã được tạo thành công!', userId: results.insertId });
        });
    });
});

// Route: Đăng nhập người dùng
router.post('/login', (req, res) => {
    const { TenDangNhap, MatKhau } = req.body;

    // Kiểm tra tên đăng nhập hoặc email
    const query = 'SELECT * FROM NguoiDung WHERE TenDangNhap = ? OR Email = ?';
    pool.query(query, [TenDangNhap, TenDangNhap], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: 'Tên đăng nhập hoặc email không tồn tại.' });
        }

        const user = results[0];

        // Kiểm tra mật khẩu
        if (MatKhau !== user.MatKhau) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác.' });
        }

        // Lưu thông tin người dùng vào session
        req.session.userId = user.NguoiDungId;

        res.json({ message: 'Đăng nhập thành công!', userId: user.NguoiDungId });
    });
});

module.exports = router;
