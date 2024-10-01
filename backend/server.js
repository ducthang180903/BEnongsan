// server.js
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const passport = require('passport');
require('dotenv').config();



// Khởi tạo ứng dụng express
const app = express();

// Cấu hình kết nối đến MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Kết nối đến MySQL
pool.getConnection((err, connection) => {
    if (err) throw err; // Kiểm tra lỗi kết nối
    console.log('Kết nối đến MySQL thành công!');

    // Giải phóng kết nối
    connection.release();
});

// Cấu hình middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cấu hình session
const sessionStore = new MySQLStore({}, pool);
app.use(session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 // 1 giờ
    }
}));

// Cấu hình Passport
app.use(passport.initialize());
app.use(passport.session());

// Import routes user
const userRoutes = require('./user/register');
app.use('/api', userRoutes); // Sử dụng router cho các API người dùng
// Import routes sanpham
const loaisanpham = require('./router/sanpham/loaisanpham');
app.use('/api', loaisanpham); // Sử dụng router cho các API người dùng

// Import routes sanpham
const sanpham = require('./router/sanpham/sanpham');
app.use('/api', sanpham); // Sử dụng router cho các API người dùng

// Import routes kho
const kho = require('./router/kho/kho');
app.use('/api', kho); // Sử dụng router cho các API người dùng

// Import routes giỏ hàng
const cart = require('./router/giohang/cart');
app.use('/api', cart); // Sử dụng router cho các API người dùng

// Bắt đầu server
app.listen(3000, () => {
    console.log('Server đang chạy trên cổng 3000');
});
