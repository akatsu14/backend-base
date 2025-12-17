# Backend - API Server

Ứng dụng server REST API cho Quiz Application sử dụng Node.js + Express + MongoDB.

## 🚀 Cài Đặt

```bash
npm install
```

## ⚙️ Cấu Hình

Tạo file `.env` từ `.env.example`:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quiz_db
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRE=7d
```

## 🏃 Chạy

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## 📁 Cấu Trúc Project

```
backend/
├── models/          # Database schemas
├── routes/          # API routes
├── controllers/     # Business logic
├── middleware/      # Middlewares
├── server.js        # Entry point
├── package.json
└── .env.example
```

## 🗄️ Models

- **User** - Người dùng
- **Exam** - Bài thi
- **Question** - Câu hỏi
- **Result** - Kết quả bài làm

## 📝 API Routes

- `/api/auth` - Authentication
- `/api/exams` - Quản lý bài thi
- `/api/questions` - Quản lý câu hỏi
- `/api/results` - Kết quả bài làm
- `/api/users` - Quản lý người dùng

## 🔐 Features

- JWT Authentication
- Role-based Access (User/Admin)
- Automatic Score Calculation
- Result History
- Error Handling

## 📦 Dependencies

- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT
- cors - CORS middleware
- dotenv - Environment variables

## 🐳 Docker

```bash
# Build
docker build -t quiz-backend .

# Run
docker run -p 5000:5000 quiz-backend
```

## 📚 Xem thêm

- [API Documentation](../docs/API.md)
- [Setup Guide](../docs/SETUP.md)
