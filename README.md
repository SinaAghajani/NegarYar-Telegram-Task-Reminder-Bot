# 🤖 NegarYar | نگاریار

> **A modern Telegram task reminder bot built with Node.js, Telegraf and MySQL.**

**نگاریار** یک دستیار مدیریت کار و یادآوری برای Telegram است که به کاربران کمک می‌کند کارهای روزانه و برنامه‌های خود را ثبت کنند و پیش از زمان انجام، یادآوری دریافت کنند.

نگاریار با تمرکز بر **سادگی، معماری تمیز، قابلیت توسعه و تجربه کاربری فارسی** طراحی شده است.

---

## ✨ Features

- ➕ ثبت کار و برنامه جدید
- 📅 نمایش برنامه امروز
- 📋 مشاهده کارهای فعال
- ⏰ زمان‌بندی دقیق برای انجام کارها
- 🔔 یادآوری خودکار
- 🕐 پشتیبانی از Timezone
- 🇮🇷 پشتیبانی از تاریخ شمسی در رابط کاربری
- ✅ علامت‌گذاری کار به‌عنوان انجام‌شده
- ❌ لغو کار
- 🗑 حذف کار
- ✏️ ویرایش کار
- ⚙️ تنظیمات کاربر
- 👤 مدیریت اطلاعات کاربر
- 🛡️ Rate Limiting
- 🔐 مدیریت کاربران Telegram
- 🗄️ ذخیره اطلاعات در MySQL
- 🧩 معماری ماژولار و قابل توسعه
- 📝 Logging با Pino
- 🔄 Graceful Shutdown
- 🧪 ساختار آماده برای Unit و Integration Testing

---

## 🔔 Reminder System

نگاریار برای هر کار، سیستم یادآوری چندمرحله‌ای دارد:

| زمان         | Reminder |
| ------------ | -------- |
| ۲۴ ساعت قبل  | 🔔       |
| ۱۲ ساعت قبل  | 🔔       |
| ۱ ساعت قبل   | 🔔       |
| ۳۰ دقیقه قبل | 🔔       |
| ۵ دقیقه قبل  | 🔔       |

نگاریار زمان باقی‌مانده تا انجام کار را در نظر می‌گیرد و یادآوری‌های مربوط به زمان‌های گذشته را ارسال نمی‌کند.

---

## 🗓️ Persian / Jalali Date Support

کاربر می‌تواند تاریخ را با تقویم شمسی وارد کند:

```text
1405/07/15
```

و زمان را به صورت ۲۴ ساعته وارد کند:

```text
18:30
```

برای جلوگیری از خطا:

```text
1405/07/05
```

صحیح است، در حالی که:

```text
1405/7/5
```

فرمت مورد انتظار نیست.

ساعت نیز به صورت ۲۴ ساعته تفسیر می‌شود:

```text
11:00 → ۱۱ صبح
23:00 → ۱۱ شب
```

نگاریار تاریخ و زمان را برای ذخیره‌سازی به UTC تبدیل کرده و هنگام نمایش، آن را بر اساس Timezone کاربر به زمان محلی و تاریخ شمسی تبدیل می‌کند.

---

## 🏗️ Architecture

پروژه با یک معماری ماژولار طراحی شده است:

```text
src/
├── app.js
│
├── bot/
│   ├── index.js
│   ├── commands/
│   ├── handlers/
│   ├── keyboards/
│   └── scenes/
│
├── config/
│   ├── env.js
│   ├── database.js
│   └── logger.js
│
├── controllers/
│
├── models/
│
├── repositories/
│
├── services/
│
├── workers/
│   └── reminder.worker.js
│
├── middleware/
│
├── utils/
│
├── validators/
│
└── database/
    ├── migrations/
    └── seeds/
```

### Application Flow

```text
Telegram User
      │
      ▼
  Telegraf Bot
      │
      ▼
 Middleware
      │
      ├── Rate Limit
      └── Authentication
      │
      ▼
 Commands / Handlers / Scenes
      │
      ▼
    Services
      │
      ▼
  Repositories
      │
      ▼
    MySQL
```

این ساختار باعث می‌شود منطق Telegram، Business Logic و Database Layer از یکدیگر جدا باقی بمانند.

---

## 🛠️ Tech Stack

### Backend

- Node.js
- CommonJS
- Telegraf
- MySQL
- mysql2
- Luxon
- jalaali-js

### Infrastructure & Utilities

- dotenv
- Pino
- node-cron
- Nodemon

### Testing

- Vitest

---

## 📦 Requirements

برای اجرای پروژه به موارد زیر نیاز دارید:

- Node.js 20+
- npm
- MySQL 8+
- Telegram Bot Token

---

## 🚀 Installation

Repository را Clone کنید:

```bash
git clone https://github.com/SinaAghajani/NegarYar-Telegram-Task-Reminder-Bot.git
```

و وارد پروژه شوید:

```bash
cd negar-yar
```

وابستگی‌ها را نصب کنید:

```bash
npm install
```

---

## ⚙️ Environment Variables

فایل `.env.example` را به `.env` تبدیل کنید:

```bash
copy .env.example .env
```

سپس مقادیر مورد نیاز را وارد کنید:

```env
BOT_TOKEN=

DB_HOST=localhost
DB_PORT=3306
DB_NAME=negar_yar
DB_USER=root
DB_PASSWORD=

DB_CONNECTION_LIMIT=10

TIMEZONE=Asia/Tehran
LOG_LEVEL=info
```

> ⚠️ فایل `.env` را هرگز Commit نکنید.

---

## 🗄️ Database Setup

ابتدا یک Database با نام زیر ایجاد کنید:

```sql
CREATE DATABASE negar_yar
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

سپس Migrationهای موجود در:

```text
src/database/migrations/
```

را به ترتیب اجرا کنید.

ساختار اصلی Database شامل جداول زیر است:

```text
users
tasks
reminders
```

---

## ▶️ Running the Bot

برای اجرای Development:

```bash
npm run dev
```

برای اجرای Production:

```bash
npm start
```

بعد از اجرای موفق، Bot به Telegram متصل شده و Reminder Worker شروع به فعالیت می‌کند.

---

## 🤖 Telegram Commands

| Command     | Description         |
| ----------- | ------------------- |
| `/start`    | شروع کار با نگاریار |
| `/tasks`    | نمایش کارهای من     |
| `/help`     | راهنمای استفاده     |
| `/cancel`   | لغو عملیات جاری     |
| `/today`    | نمایش برنامه امروز  |
| `/add`      | افزودن کار جدید     |
| `/settings` | تنظیمات نگاریار     |

علاوه بر Commands، کاربر می‌تواند از Keyboard اصلی ربات نیز استفاده کند.

---

## 💬 Main Menu

```text
➕ افزودن کار

📋 کارهای من    📅 برنامه امروز

⚙️ تنظیمات
```

---

## 🔐 Security

نگاریار برخی اصول امنیتی پایه را در معماری خود در نظر گرفته است:

- Environment Variables برای اطلاعات حساس
- عدم ذخیره Bot Token در Source Code
- Rate Limiting برای جلوگیری از درخواست‌های بیش از حد
- اعتبارسنجی ورودی‌ها
- محدود کردن عملیات Task به صاحب همان Task
- استفاده از Parameterized Queries در MySQL
- مدیریت خطا و Logging
- Graceful Shutdown

---

## 👤 User Management

برای هر کاربر Telegram اطلاعاتی مانند موارد زیر ذخیره می‌شود:

```text
Telegram ID
Username
First Name
Last Name
Language Code
Timezone
Account Status
Created At
Updated At
```

هر Task نیز به کاربر مربوط به خودش متصل است.

---

## 🔔 Reminder Worker

Reminder Worker به صورت دوره‌ای Reminderهای سررسیدشده را بررسی می‌کند.

فرآیند کلی:

```text
MySQL
  │
  ▼
Pending Reminders
  │
  ▼
Reminder Worker
  │
  ▼
Check Due Time
  │
  ▼
Telegram
  │
  ▼
User Notification
```

---

## 🧪 Testing

ساختار پروژه برای تست‌های Unit و Integration آماده شده است.

اجرای تست‌ها:

```bash
npm test
```

اجرای تست‌ها در حالت Watch:

```bash
npm run test:watch
```

---

## 🛣️ Roadmap

نگاریار به صورت مرحله‌ای توسعه داده می‌شود.

### Completed

- [x] Telegram Bot
- [x] User Authentication
- [x] MySQL Database
- [x] Task Creation
- [x] Task Listing
- [x] Task Completion
- [x] Task Cancellation
- [x] Task Deletion
- [x] Reminder System
- [x] Jalali Date Support
- [x] Timezone Support
- [x] Rate Limiting
- [x] User Settings
- [x] Today Schedule

### Planned

- [ ] Custom Reminder Settings
- [ ] Reminder Enable / Disable
- [ ] Recurring Tasks
- [ ] Daily / Weekly / Monthly Tasks
- [ ] Task Categories
- [ ] Task Priority
- [ ] Search Tasks
- [ ] Pagination
- [ ] Advanced Statistics
- [ ] Admin Dashboard
- [ ] Redis-based Worker
- [ ] Distributed Reminder Processing
- [ ] Docker Support
- [ ] CI/CD
- [ ] Automated Database Migrations
- [ ] Improved Test Coverage

---

## 🌐 Open Source

NegarYar is an open-source project built with the goal of creating a clean, practical and extensible Telegram task reminder system.

Developers are welcome to:

- Fork the project
- Create issues
- Suggest improvements
- Submit pull requests
- Improve documentation
- Add new features

---

## 🤝 Contributing

Contribution is welcome.

### 1. Fork

Fork the repository.

### 2. Clone

```bash
git clone https://github.com/SinaAghajani/negar-yar.git
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature
```

### 4. Make Changes

Implement your feature or fix.

### 5. Run Tests

```bash
npm test
```

### 6. Commit

```bash
git add .
git commit -m "feat: add your feature"
```

### 7. Push

```bash
git push origin feature/your-feature
```

### 8. Pull Request

Create a Pull Request and describe your changes.

---

## 📜 License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

### Sina Aghajani

Frontend Developer • Bot Developer • Educational Technology

- GitHub: `https://github.com/SinaAghajani`
- LinkedIn: `https://www.linkedin.com/in/sina-aghajani1/`

---

## ⭐ Support

If you find NegarYar useful, consider giving the repository a ⭐ on GitHub.

Your feedback, issues and contributions help make the project better.

---

<p align="center">

**🤖 NegarYar — Never forget what matters.**

ساخته‌شده با ❤️ و Node.js

</p>
