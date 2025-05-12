import express from "express";
import sqlite3 from "sqlite3";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

import dotenv from 'dotenv';
dotenv.config();


// Системные пути
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Инициализация сервера и БД
const app = express();
const PORT = 3000;
const db = new sqlite3.Database(
  path.join(__dirname, "db.sqlite"),
  err => err && console.error("Ошибка при подключении к базе:", err)
);

// Nodemailer transporter (используйте .env для EMAIL_USER и EMAIL_PASS)
const mailer = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Мидлвары
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Начальные данные
const initialHotels = [
  { title: '"Ритц Карлтон" Алматы', description: 'Роскошный 5-звездочный отель', price: '₸ 45 000 / ночь', rating: '★★★★★', image: 'https://source.unsplash.com/800x600/?luxury,hotel' },
  { title: 'Отель "Казахстан"', description: 'Отель с видом на горы', price: '₸ 30 000 / ночь', rating: '★★★★', image: 'https://source.unsplash.com/800x600/?building,hotel' },
  { title: '"Holiday Inn Express"', description: 'Современный отель с завтраком', price: '₸ 25 000 / ночь', rating: '★★★', image: 'https://source.unsplash.com/800x600/?holiday-inn,hotel' }
];

// Схема БД и сид данных
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               name TEXT NOT NULL,
                                               surname TEXT NOT NULL,
                                               email TEXT UNIQUE NOT NULL,
                                               login TEXT UNIQUE NOT NULL,
                                               password TEXT NOT NULL,
                                               photo TEXT,
                                               role TEXT DEFAULT 'user'
          )`);

  db.run(`CREATE TABLE IF NOT EXISTS hotels (
                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                title TEXT NOT NULL,
                                                description TEXT NOT NULL,
                                                price TEXT NOT NULL,
                                                rating TEXT NOT NULL,
                                                image TEXT NOT NULL
          )`);

  db.run(`CREATE TABLE IF NOT EXISTS bookings (
                                                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                  user_login TEXT NOT NULL,
                                                  hotel_id INTEGER NOT NULL,
                                                  booked_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`);

  // Сид отелей
  db.get(`SELECT COUNT(*) AS cnt FROM hotels`, (err, row) => {
    if (err) return console.error(err);
    if (row.cnt === 0) {
      const stmt = db.prepare(`INSERT INTO hotels (title,description,price,rating,image) VALUES (?,?,?,?,?)`);
      initialHotels.forEach(h => stmt.run(h.title, h.description, h.price, h.rating, h.image));
      stmt.finalize();
      console.log(`🌱 Вставлено ${initialHotels.length} отелей`);
    }
  });

  // Сид админа
  db.get(`SELECT * FROM users WHERE login = 'admin'`, (err, user) => {
    if (!user) {
      db.run(`INSERT INTO users (name,surname,email,login,password,photo,role) VALUES ('Админ','Главный','admin@example.com','admin','admin',null,'admin')`);
    }
  });
});

// Вспомогательная проверка админа
const isAdmin = (login, cb) => {
  db.get(`SELECT role FROM users WHERE login = ?`, [login], (e, row) => cb(e, row?.role === 'admin'));
};

// REST API
app.get('/api/hotels', (_, res) => {
  db.all('SELECT * FROM hotels', [], (e, rows) => e
    ? res.status(500).json({ message: 'Ошибка БД' })
    : res.json(rows)
  );
});

app.post('/api/hotels', (req, res) => {
  const { login, title, description, price, rating, image } = req.body;
  isAdmin(login, (e, ok) => {
    if (e) return res.status(500).json({ message: 'Ошибка БД' });
    if (!ok) return res.status(403).json({ message: 'Доступ запрещён' });
    db.run(
      'INSERT INTO hotels (title,description,price,rating,image) VALUES (?,?,?,?,?)',
      [title, description, price, rating, image],
      function(err) {
        if (err) return res.status(500).json({ message: 'Ошибка добавления' });
        res.json({ message: 'Отель добавлен', id: this.lastID });
      }
    );
  });
});

app.put('/api/hotels/:id', (req, res) => {
  const id = req.params.id;
  const { login, title, description, price, rating, image } = req.body;
  isAdmin(login, (e, ok) => {
    if (e) return res.status(500).json({ message: 'Ошибка БД' });
    if (!ok) return res.status(403).json({ message: 'Доступ запрещён' });
    db.run(
      'UPDATE hotels SET title=?,description=?,price=?,rating=?,image=? WHERE id=?',
      [title, description, price, rating, image, id],
      err => err
        ? res.status(500).json({ message: 'Ошибка обновления' })
        : res.json({ message: 'Отель обновлён' })
    );
  });
});

app.delete('/api/hotels/:id', (req, res) => {
  const id = req.params.id;
  const { login } = req.body;
  isAdmin(login, (e, ok) => {
    if (e) return res.status(500).json({ message: 'Ошибка БД' });
    if (!ok) return res.status(403).json({ message: 'Доступ запрещён' });
    db.run('DELETE FROM hotels WHERE id=?', [id], err =>
      err
        ? res.status(500).json({ message: 'Ошибка удаления' })
        : res.json({ message: 'Отель удалён' })
    );
  });
});

app.post('/api/register', (req, res) => {
  const { name, surname, email, login, password, photo } = req.body;
  const role = login === 'admin' ? 'admin' : 'user';
  db.run(
    'INSERT INTO users (name,surname,email,login,password,photo,role) VALUES (?,?,?,?,?,?,?)',
    [name, surname, email, login, password, photo || null, role],
    err =>
      err
        ? res.status(400).json({ message: 'E-mail или логин уже используется' })
        : res.status(201).json({ message: 'Пользователь зарегистрирован' })
  );
});

app.post('/api/login', (req, res) => {
  const { login, password } = req.body;
  db.get(
    'SELECT name,surname,email,login,photo,role FROM users WHERE login=? AND password=?',
    [login, password],
    (e, u) =>
      e
        ? res.status(500).json({ message: 'Ошибка БД' })
        : u
          ? res.json({ message: 'Успешный вход', user: u })
          : res.status(401).json({ message: 'Неверный логин или пароль' })
  );
});

// Эндпоинт бронирования + email
app.post('/api/book', (req, res) => {
  const { login, email, hotelId } = req.body;
  if (!login || !email || !hotelId) {
    return res.status(400).json({ message: 'Неверные данные (login/email/hotelId)' });
  }

  // 1) Сохраняем бронь в БД
  db.run(
    'INSERT INTO bookings (user_login, hotel_id) VALUES (?, ?)',
    [login, hotelId],
    function(err) {
      if (err) return res.status(500).json({ message: 'Ошибка БД при бронировании' });

      // 2) Достаём данные отеля для письма
      db.get('SELECT title, price FROM hotels WHERE id=?', [hotelId], (e, hotel) => {
        if (e || !hotel) {
          console.error(e);
          return res.status(500).json({ message: 'Отель не найден' });
        }

        // 3) Отправляем email
        const html = `
          <h2>Спасибо за бронирование!</h2>
          <p>Отель: <b>${hotel.title}</b></p>
          <p>Цена: ${hotel.price}</p>
          <p>До встречи!</p>
        `;
        mailer.sendMail(
          {
            from: '"HotelFinder" <no-reply@hotelfinder.kz>',
            to: email,
            subject: `Ваше бронирование: ${hotel.title}`,
            html
          },
          mailErr => {
            if (mailErr) console.error('Ошибка отправки письма:', mailErr);
          }
        );

        // 4) Отвечаем клиенту
        res.json({ success: true });
      });
    }
  );
});

// Старт сервера
app.listen(PORT, () => console.log(`✅ Сервер запущен на http://localhost:${PORT}`));
