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
const PORT = process.env.PORT;
const allTables = ['Promotions','Stores','Users','roles','comments','category'];
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    methods: 'GET,POST,PATCH,PUT,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type','Authorization','Cache-Control'],
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
    try {
        if(!allTables.includes(table)) {
            return res.status(400).send('Таблица не найдена');
        }

        let rows;

        const [result] = await pool.query('DELETE FROM Promotions WHERE end_date < CURDATE()');
        
        if (table === 'Users') {
            [rows] = await pool.query('SELECT * FROM Users');
            const processedRows = rows.map(row => ({
                ...row,
                Password: '********' // Маскируем пароль
            }));
            return res.status(200).json(processedRows);
        }
        
        if (table === 'Promotions') {
            [rows] = await pool.query(`
                SELECT 
                    p.*,
                    s.name AS store_name,
                    JSON_ARRAYAGG(c.name) AS categories_array
                FROM Promotions p
                JOIN Stores s ON p.Stores_id = s.Store_id
                LEFT JOIN category_has_Promotions chp ON p.Promotion_id = chp.Promotions_Promotion_id
                LEFT JOIN category c ON chp.category_category_id = c.category_id
                WHERE p.end_date >= CURDATE()
                GROUP BY p.Promotion_id
            `);
            
            const processedRows = rows.map(row => ({
                ...row,
                categories_array: row.categories_array 
                    ? JSON.parse(row.categories_array).join(', ') 
                    : 'Нет категорий'
            }));
            
            return res.status(200).json(processedRows);
        }
        
        // Для всех остальных таблиц
        [rows] = await pool.query(`SELECT * FROM ${table}`);
        return res.status(200).json(rows);
        
    } catch (error) {
        console.error(`Ошибка при запросе к таблице ${table}:`, error);
        return res.status(500).json({ 
            error: 'Внутренняя ошибка сервера',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

app.get('/api/getLinkStore', async (req, res) => {
    try {
        const { store } = req.query;
        const response = await pool.query('SELECT link FROM Stores WHERE name = ?', [store]);
        const link = response[0][0].link;
        res.status(200).json(link);
    } catch (error) {
        console.error('Ошибка при получении списка магазинов:', error);
        res.status(500).json({ error: 'Ошибка при получении списка магазинов' });
    }
});

app.get('/api/images', async (req, res) => {
    try {
        const imageDir = path.join(path.dirname(__dirname), 'public', 'images');
        const files = await fs.readdir(imageDir);
        const images = files.filter(file =>
            ['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase())
        );
        res.status(200).json(images.map(filename => ({ image: filename })));
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
        };

        res.status(200).json({ success: true, id: promoId });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при добавлении промокода'
        });
    }
});

app.put('/api/updatePromo', async (req, res) => {
    try {
      const {
        id,
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
  
      // Обновление самой акции
      const [promoResult] = await pool.query(
        `UPDATE Promotions 
         SET code = ?, title = ?, description = ?, full_description = ?, 
             discount_type = ?, discount_value = ?, start_date = ?, end_date = ?, image = ?, Stores_id = ?
         WHERE Promotion_id = ?`,
        [code, title, description, full_description, discount_type,
          discount_value, start_date, end_date, image, store_id, id]
      );

      // Удаление старых категорий
      await pool.query(
        `DELETE FROM category_has_Promotions WHERE Promotions_Promotion_id = ?`,
        [id]
      );
  
      // Добавление новых категорий
      if (categories && categories.length > 0) {
        const categoryQueries = categories.map(categoryId =>
          pool.query(
            `INSERT INTO category_has_Promotions (category_category_id, Promotions_Promotion_id) 
             VALUES (?, ?)`,
            [categoryId, id] 
          )
        );
        await Promise.all(categoryQueries);
      }
  
      res.status(200).json({ success: true, id });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении промокода'
      });
    }
  });

app.post('/api/addStore', async (req, res) => {
    try{
        const { name, description, link, contacts } = req.body;
        const [result] = await pool.query(
            `INSERT INTO Stores (name, description, link, contacts) VALUES (?, ?, ?, ?)`,
            [name, description, link, contacts]
        );
        res.status(200).json({ success: true, id: result.insertId });
    }catch(e) {
        console.error(e);
        res.status(404).json({success: false, message: 'Ошибка при добавлении магазина'});
    }
}); 

app.put('/api/editStore', async (req, res) => {
    try{
        const { id, name, description, link, contacts } = req.body;
        const [result] = await pool.query(
            `UPDATE Stores SET name = ?, description = ?, link = ?, contacts = ? WHERE Store_id = ?`,
            [name, description, link, contacts, id]
        );
        res.status(200).json({ success: true, id: result.insertId });
    }catch(e) {
        console.error(e);
        res.status(404).json({success: false, message: 'Ошибка при изменении магазина'});
    }
});

app.put('/api/changeRole', async (req, res) => {
    try {
        const { id, role } = req.body; 
        const [result] = await pool.query(
            `UPDATE Users SET roles_id = ? WHERE user_id = ?`,
            [role, id]
        );
        res.status(200).json({ success: true, id });
    }catch(e) {
        console.error(e);
        res.status(404).json({success: false, message: 'Ошибка при изменении роли'});
    }
});

app.put('/api/setStoreOfManager', async (req, res) => {
    try {
        const { id, role, store } = req.body;
        const [result] = await pool.query(
            `UPDATE Users SET roles_id = ? WHERE user_id = ?`,
            [role, id]
        );

        const [result2] = await pool.query(
            `UPDATE userStores SET Stores_id = ? WHERE user_id = ?`,
            [store, id]
        );
        res.status(200).json({ success: true, id });
    }catch(e) {
        console.error(e);
        res.status(404).json({success: false, message: 'Ошибка при создании связи между менеджером и магазином'});
    }
});

app.post('/api/addCategory', async (req, res) => {
    try {
        const { name } = req.body;
        const [result] = await pool.query(
            'INSERT INTO category (name) VALUES (?)',
            [name]
        );
        res.status(200).json({ success: true, id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при добавлении категории'
        });
    }
});

app.put('/api/editCategory', async (req, res) => {
    try {
        const { id, name } = req.body;
        const [result] = await pool.query(
            'UPDATE category SET name = ? WHERE category_id = ?',
            [name, id]
        );
        res.status(200).json({ success: true, id });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при редактировании категории'
        });
    }
})

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
            [email, hashedPassword, name, 0, 3, birthday]
        );


        // Получаем данные созданного пользователя
        const [newUser] = await pool.query(
            'SELECT * FROM Users WHERE user_id = ?',
            [result.insertId]
        );

        await pool.query(
            `INSERT INTO userStores (user_id, Stores_id) VALUES (?, ?)`,
            [newUser[0].user_id, 1]
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
            await pool.query('DELETE FROM userStores WHERE user_id = ?', [result.insertId]);
            
            return res.status(500).json({
                success: false,
                message: 'Не удалось отправить письмо подтверждения'
            });
        }

    } catch (error) {
         res.status(500).json({
                success: false,
                message: 'Ошибка сервера',error,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
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
            'UPDATE Users SET email_verified = 1 WHERE email = ?',
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
});

app.patch('/profile/change/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { email, name, date_of_birth } = req.body;

        // Проверка существования пользователя
        const [users] = await pool.query(
            'SELECT * FROM Users WHERE user_id = ?', 
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Пользователь не найден' 
            });
        }
        
        const user = users[0];
        const updates = {};
        
        // Валидация email
        if (email !== undefined && email !== '') {
            if (email !== user.email) {
                const [existing] = await pool.query(
                    'SELECT user_id FROM Users WHERE email = ? AND user_id != ?',
                    [email, userId]
                );
                
                if (existing.length > 0) {
                    return res.status(409).json({ 
                        success: false, 
                        message: 'Email уже используется другим пользователем' 
                    });
                }
                updates.email = email;
            }
        }
        
        // Валидация имени
        if (name !== undefined && name !== '' && name !== user.name) {
            if (name.length < 2 || name.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Имя должно быть от 2 до 50 символов'
                });
            }
            updates.name = name;
        }
        
        // Валидация даты рождения
        if (date_of_birth !== undefined && date_of_birth !== '') {
            const birthDate = new Date(date_of_birth);
            if (isNaN(birthDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Некорректный формат даты'
                });
            }
            updates.date_of_birth = date_of_birth;
        }
        
        // Если нет изменений
        if (Object.keys(updates).length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: 'Нет изменений для обновления',
                user: user
            });
        }
        
        // Обновление в базе данных
        await pool.query(
            'UPDATE Users SET ? WHERE user_id = ?',
            [updates, userId]
        );
        
        // Получение обновленных данных
        const [updatedUser] = await pool.query(
            'SELECT * FROM Users WHERE user_id = ?',
            [userId]
        );
        
        res.status(200).json({ 
            success: true, 
            message: 'Данные успешно обновлены',
            user: updatedUser[0]
        });
        
    } catch (error) {
        console.error('Ошибка при обновлении пользователя:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Внутренняя ошибка сервера',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.get('/token', async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    try {
        const payload = jwt.verify(token,process.env.JWT_REFRESH_SECRET);
        const [rows] = await pool.query(
            'SELECT * FROM Users WHERE user_id = ?',
            [payload.userId]
        );
        res.json({
            success: true,
            id: payload.userId,
            roles_id: rows[0].roles_id
        })
    }
    catch(err) {
        res.sendStatus(403);
    }
});

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

        // Проверяем существование записи
        const [existing] = await pool.query(
            `SELECT * FROM ${table} WHERE ${getPrimaryKeyField(table)} = ?`, 
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Запись не найдена' 
            });
        }

        // Удаляем запись
        await pool.query(
            `DELETE FROM ${table} WHERE ${getPrimaryKeyField(table)} = ?`,
            [id]
        );
        
        res.status(200).json({ 
            success: true, 
            message: 'Запись успешно удалена' 
        });
        
    } catch (error) {
        console.error('Ошибка при удалении:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка сервера при удалении',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.get('/getManagerStore', async(req, res) => {
    try {
        const { id } = req.query;
        const [store] = await pool.query(
            `SELECT name, Store_id
            FROM Stores
            WHERE Store_id = (SELECT Stores_id
                              FROM userStores
                              WHERE user_id = ? )`,
                              [id]
        );
        if (store.length !== 0) {
            res.status(200).json({
                success: true,
                store: store[0].name,
                id:store[0].Store_id,
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'За менеджером не закреплен магазин'
            });
            console.log('За менеджером не закреплен магазин');
        }
    }
    catch(e) {
        console.error(e.message);
    }
})

// Вспомогательная функция для определения первичного ключа
function getPrimaryKeyField(table) {
    const fields = {
        'Users': 'user_id',
        'Promotions': 'Promotion_id',
        'Stores': 'Store_id',
        'category': 'category_id'
    };
    return fields[table] || 'id';
}

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
