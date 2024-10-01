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

// API thêm sản phẩm vào giỏ hàng
router.post('/addcart', async (req, res) => {
    const { SanPhamId, SoLuong } = req.body;
    const NguoiDungId = req.session.userId || null; // Nếu người dùng đã đăng nhập
    const SessionId = req.sessionID; // Sử dụng sessionId cho người dùng chưa đăng nhập

    try {
        // Kiểm tra xem giỏ hàng đã tồn tại cho người dùng hoặc session này chưa
        let [cart] = await pool.query(
            'SELECT * FROM GioHang WHERE (NguoiDungId = ? OR SessionId = ?) LIMIT 1',
            [NguoiDungId, SessionId]
        );

        let GioHangId;

        if (cart.length === 0) {
            // Nếu giỏ hàng chưa tồn tại, tạo mới
            const [newCart] = await pool.query(
                'INSERT INTO GioHang (NguoiDungId, SessionId, ThoiGianTao) VALUES (?, ?, NOW())',
                [NguoiDungId, SessionId]
            );
            GioHangId = newCart.insertId;
        } else {
            // Nếu giỏ hàng đã tồn tại
            GioHangId = cart[0].GioHangId;
        }

        // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
        const [existingProduct] = await pool.query(
            'SELECT * FROM ChiTietGioHang WHERE GioHangId = ? AND SanPhamId = ?',
            [GioHangId, SanPhamId]
        );

        if (existingProduct.length > 0) {
            // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
            await pool.query(
                'UPDATE ChiTietGioHang SET SoLuong = SoLuong + ? WHERE GioHangId = ? AND SanPhamId = ?',
                [SoLuong, GioHangId, SanPhamId]
            );
        } else {
            // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
            await pool.query(
                'INSERT INTO ChiTietGioHang (GioHangId, SanPhamId, SoLuong) VALUES (?, ?, ?)',
                [GioHangId, SanPhamId, SoLuong]
            );
        }

        res.status(201).json({ message: 'Sản phẩm đã được thêm vào giỏ hàng thành công!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API xóa một sản phẩm trong ChiTietGioHang
router.delete('/cart/item/:chiTietGioHangId', async (req, res) => {
    const { chiTietGioHangId } = req.params; // Lấy ID của chi tiết giỏ hàng từ URL

    try {
        // Xóa sản phẩm khỏi bảng ChiTietGioHang theo chiTietGioHangId
        const [result] = await pool.query('DELETE FROM ChiTietGioHang WHERE ChiTietGioHangId = ?', [chiTietGioHangId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại trong chi tiết giỏ hàng.' });
        }

        res.status(200).json({ message: 'Sản phẩm đã được xóa khỏi giỏ hàng thành công!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
