import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';

dotenv.config({path:'../.env'});
const app = express();
const PORT = 3000;
const allTables = ['Promotions','Stores','Users','roles','comments','category'];
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type',
};

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true, // для порта 465 всегда true
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        // не проверяем сертификат
        rejectUnauthorized: false
    }
});

// Проверка соединения
transporter.verify(function(error, success) {
    if (error) {
        console.log('Ошибка при настройке почты:', error);
    } else {
        console.log('Сервер готов к отправке писем');
    }
});


app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Настройки подключения к базе данных
const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
};

const pool = mysql.createPool(dbConfig);

// Получаем __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function item(table, res) {
    if(!allTables.includes(table)){
        return res.status(400).send('Таблица не найдена');
    }

    if (table === 'Promotions'){
        const [rows] = await pool.query(`
            SELECT 
                p.code, 
                p.description, 
                p.discount_value, 
                p.discount_type, 
                p.start_date, 
                p.end_date, 
                p.Promotion_id, 
                p.image,
                p.title,
                p.full_description,
                s.name AS store_name,
                GROUP_CONCAT(c.name) AS categories
            FROM Promotions p
            JOIN Stores s ON p.Stores_id = s.Store_id
            LEFT JOIN category_has_Promotions chp ON p.Promotion_id = chp.Promotions_Promotion_id
            LEFT JOIN category c ON chp.category_category_id = c.category_id
            GROUP BY p.Promotion_id
        `);
        res.status(200).json(rows);
    }else{
        const [rows] = await pool.query(`SELECT * FROM ${table}`);
        res.status(200).json(rows);
    }
}

app.get('/api/images', async (req, res) => {
    try {
        const imageDir = path.join(path.dirname(__dirname), 'public', 'images');
        const files = await fs.readdir(imageDir);
        const images = files.filter(file =>
            ['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase())
        );
        res.status(200).json(images.map(filename => ({ image: filename })));
        await fs.writeFile(path.join(imageDir,'1.txt'), 'Фотографии загрузились!',(err) => {
            if (err) {
                console.log(err);
                return;
            }else {
                console.log('Файл записан');
            }
        });
    } catch (error) {
        console.error('Ошибка при чтении директории с изображениями:', error);
        res.status(500).json({ error: 'Ошибка при получении списка изображений' });
    }
});

app.get('/api/:table', async (req, res) => {
    const table = req.params.table;
    await item(table, res);
});

app.post('/api/addPromo', async(req,res) => {
    try {
        const {
            code,
            title,
            description,
            full_description,
            discount_type,
            discount_value,
            start_date,
            end_date,
            image,
            categories,
            store_id
        } = req.body;

        const [promoResult] = await pool.query(
            `INSERT INTO Promotions (code, title, description, full_description, 
            discount_type, discount_value, start_date, end_date, image, Stores_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [code, title, description, full_description, discount_type,
                discount_value, start_date, end_date, image, store_id]
        );

        const promoId = promoResult.insertId;

        // Добавление связей в таблицу category_has_Promotions
        if (categories && categories.length > 0) {
            const categoryQueries = categories.map(categoryId =>
                pool.query(
                    `INSERT INTO category_has_Promotions (category_category_id, Promotions_Promotion_id) 
                    VALUES (?, ?)`,
                    [categoryId, promoId]
                )
            );
            await Promise.all(categoryQueries);
        }

        res.status(200).json({ success: true, id: promoId });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при добавлении промокода'
        });
    }
});

app.post('/api/registration', async(req,res) => {
    try {
        const { name, email, birthday, password } = req.body;

        // Проверяем, что все необходимые поля присутствуют
        if (!name || !email || !birthday || !password) {
            return res.status(400).json({
                success: false,
                message: 'Не все обязательные поля заполнены'
            });
        }

        // Проверяем существование пользователя
        const [existingUsers] = await pool.query(
            'SELECT * FROM Users WHERE email = ?', 
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Пользователь с таким email уже существует',
              });
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        // Если пользователя нет, создаем нового
        const [result] = await pool.query(
            `INSERT INTO Users (email, Password, name, email_verified, roles_id, date_of_birth) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [email, hashedPassword, name, 0, 2, birthday]
        );


        // Получаем данные созданного пользователя
        const [newUser] = await pool.query(
            'SELECT * FROM Users WHERE user_id = ?',
            [result.insertId]
        );

        const token = jwt.sign({ email }, process.env.JWT_SECRET, {expiresIn: '24h'});
        const verifyLink = `${process.env.BACKEND_URL}/api/account/verify-email?token=${token}`;

        // Отправляем email
        const mailOptions = {
            from: `"Сервис промокодов" <${process.env.EMAIL_USER}>`, // Важно указать имя отправителя
            to: email,
            subject: 'Подтверждение регистрации',
            text: `Привет, ${name}!\n\nДля подтверждения почты перейдите по ссылке: ${verifyLink}`,
        };
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Письмо отправлено:', info.response);
            return res.status(200).json({
                success: true,
                message: 'Регистрация прошла успешно! Письмо отправлено.',
            });
        } catch (emailError) {
            console.error('Ошибка отправки письма:', emailError);
            
            // Удаляем пользователя, если письмо не отправилось
            await pool.query('DELETE FROM Users WHERE user_id = ?', [result.insertId]);
            
            return res.status(500).json({
                success: false,
                message: 'Не удалось отправить письмо подтверждения'
            });
        }

    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Ошибка сервера',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [users] = await pool.query(
            'SELECT * FROM Users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
          }
      
          const user = users[0];
          const isPasswordCorrect = await bcrypt.compare(password, user.Password);
      
          if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
          }
      
          const accessToken = jwt.sign(
            { userId: user.user_id, email: user.email },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '15m' }
          );
      
          const refreshToken = jwt.sign(
            { userId: user.user_id, email: user.email },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
          );
      
          // Устанавливаем httpOnly куку
          res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, // поставить true на HTTPS
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
          });
      
          res.status(200).json({ success: true, accessToken, user:user, message: 'Вход успешно выполнен' });
      
        } catch (error) {
          console.error('Ошибка при входе:', error);
          res.status(500).json({ success: false, message: 'Ошибка сервера' });
        }
});

app.get('/api/account/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await pool.query(
            'UPDATE Users SET email_verified = 1, roles_id = 3 WHERE email = ?',
            [decoded.email]
        );

        res.redirect(`${process.env.FRONTEND_URL}/autarization`);
    } catch (error) {
        console.error('Ошибка при подтверждении email:', error);
        res.status(400).json({ 
            success: false, 
            message: 'Недействительная или устаревшая ссылка подтверждения' 
        });
    }
});

app.post('/logout', async (req, res) => {
    try {
        res.clearCookie('refreshToken',{
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
        });

        res.status(200).json({success: true, message: 'Выход успешно выполнен'});
    } catch (error) {
        res.status(400).json({success: false, message: 'Ошибка при выходе'});
    }
});

app.get('/profile/me', async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ 
              success: false, 
              message: 'Токен отсутствует' 
            });
        };
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        const [rows] = await pool.query(
            `Select * from Users where user_id = ?`,
            [decoded.userId]        
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({
              success: false,
              message: 'Пользователь не найден'
            });
        }

        const user = rows[0];
         let roleName;
         switch(user.roles_id) {
             case 2: 
                 roleName = 'Пользователь с неподтвержденной почтой';
                 break;
             case 3: 
                 roleName = 'Пользователь';
                 break;
             case 4: 
                 roleName = 'Администратор';
                 break;
             case 5: 
                 roleName = 'Менеджер';
                 break;
             default:
                 roleName = 'Неизвестная роль';
         }
         
         res.status(200).json({
             success: true,
             name: user.name,
             email: user.email,
             role: roleName,
             date_of_birth: user.date_of_birth,
         });
    } catch (error) {
        res.status(400).json({success: false, message: 'Ошибка при получении пользователя'});
    }
})

app.get('/token', async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    try {
        const payload = jwt.verify(token,process.env.JWT_REFRESH_SECRET);
        res.json({
            success: true,
            id: payload.userId,
            roles_id: payload.roles_id
        })
    }
    catch(err) {
        res.sendStatus(403);
    }
})

// Получение информации о категории по ID
app.get('/api/category/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM category WHERE category_id = ?',
            [req.params.id]
        );
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Категория не найдена' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Получение промокодов по категории
app.get('/api/promotions/category/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.*, 
                s.name AS store_name
            FROM Promotions p
            JOIN Stores s ON p.Stores_id = s.Store_id
            JOIN category_has_Promotions chp ON p.Promotion_id = chp.Promotions_Promotion_id
            WHERE chp.category_category_id = ?
        `, [req.params.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.delete('/api/:table/:id', async (req, res) => {
    try {
        const { table, id } = req.params;
        
        if (!allTables.includes(table)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Таблица не найдена' 
            });
        }

        await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
        
        res.status(200).json({ 
            success: true, 
            message: 'Запись успешно удалена' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка при удалении записи' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
