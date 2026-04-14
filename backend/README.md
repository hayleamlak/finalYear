# Express Backend (Standalone)

This folder contains your new standalone backend using Node.js + Express + Prisma.

## 1) Setup

1. Copy `.env.example` to `.env` in this folder.
2. Set `DATABASE_URL` to your PostgreSQL connection string.
3. Set a strong `JWT_SECRET` (minimum 16 characters).

## 2) Install and run

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

Server base URL: `http://localhost:4000`

## 3) API endpoints

- `GET /` -> service message
- `GET /api/v1/health` -> health check + DB ping
- `POST /api/v1/auth/token` -> issue JWT for a user payload
- `GET /api/v1/products` -> paginated products list
- `GET /api/v1/products/:productId` -> product details
- `POST /api/v1/products` -> create product (requires Bearer token)

## 4) Mobile app integration

Use this backend base URL in your Expo app and send `Authorization: Bearer <token>` for protected routes.

## 5) Next migration steps

- Add `users`, `orders`, `cart`, `checkout`, and `payments` routes.
- Replace temporary token endpoint with full signup/login and password hashing or your preferred identity provider.
- Add role-based authorization middleware per route.
- Add refresh tokens, rate limiting, and audit logs for production.
