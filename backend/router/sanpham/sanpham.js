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

// Thêm sản phẩm (cùng với hình ảnh)
router.post('/sanpham', (req, res) => {
    const { TenSanPham, MoTa, Gia, SoLuongKho, LoaiSanPhamId, HinhAnh } = req.body;

    // Thêm sản phẩm
    pool.query('INSERT INTO SanPham (TenSanPham, MoTa, Gia, SoLuongKho, LoaiSanPhamId) VALUES (?, ?, ?, ?, ?)', 
    [TenSanPham, MoTa, Gia, SoLuongKho, LoaiSanPhamId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const sanPhamId = results.insertId;

        // Thêm hình ảnh cho sản phẩm
        const hinhAnhQueries = HinhAnh.map(image => 
            new Promise((resolve, reject) => {
                pool.query('INSERT INTO HinhAnhSanPham (SanPhamId, DuongDanHinh) VALUES (?, ?)', [sanPhamId, image], (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            })
        );

        // Xử lý các promise để thêm tất cả hình ảnh
        Promise.all(hinhAnhQueries)
            .then(() => {
                res.status(201).json({ message: 'Sản phẩm đã được tạo thành công!', sanPhamId });
            })
            .catch(error => {
                res.status(500).json({ error: error.message });
            });
    });
});

// Sửa sản phẩm
router.put('/sanpham/:id', (req, res) => {
    const { id } = req.params;
    const { TenSanPham, MoTa, Gia, SoLuongKho, LoaiSanPhamId, HinhAnh } = req.body;

    // Cập nhật sản phẩm
    pool.query('UPDATE SanPham SET TenSanPham = ?, MoTa = ?, Gia = ?, SoLuongKho = ?, LoaiSanPhamId = ? WHERE SanPhamId = ?', 
    [TenSanPham, MoTa, Gia, SoLuongKho, LoaiSanPhamId, id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
        }

        // Cập nhật hình ảnh (xóa hết hình ảnh cũ và thêm hình ảnh mới)
        pool.query('DELETE FROM HinhAnhSanPham WHERE SanPhamId = ?', [id], (error) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }

            const hinhAnhQueries = HinhAnh.map(image => 
                new Promise((resolve, reject) => {
                    pool.query('INSERT INTO HinhAnhSanPham (SanPhamId, DuongDanHinh) VALUES (?, ?)', [id, image], (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                })
            );

            // Xử lý các promise để thêm tất cả hình ảnh mới
            Promise.all(hinhAnhQueries)
                .then(() => {
                    res.json({ message: 'Sản phẩm đã được cập nhật thành công!' });
                })
                .catch(error => {
                    res.status(500).json({ error: error.message });
                });
        });
    });
});

// Xóa sản phẩm
router.delete('/sanpham/:id', (req, res) => {
    const { id } = req.params;

    // Xóa hình ảnh liên quan
    pool.query('DELETE FROM HinhAnhSanPham WHERE SanPhamId = ?', [id], (error) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // Xóa sản phẩm
        pool.query('DELETE FROM SanPham WHERE SanPhamId = ?', [id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
            }
            res.json({ message: 'Sản phẩm đã được xóa thành công!' });
        });
    });
});

// Hiển thị tất cả sản phẩm
router.get('/sanpham', (req, res) => {
    pool.query('SELECT * FROM SanPham', (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
});

module.exports = router;
