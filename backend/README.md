# Express Backend (Standalone)

This folder contains your new standalone backend using Node.js + Express + Prisma.

## 1) Setup

1. Create `.env` in this folder.
2. Set `DATABASE_URL` to your PostgreSQL connection string.
3. Set `CLERK_SECRET_KEY` from your Clerk dashboard.
4. Set `CLIENT_ORIGIN` to your frontend origin.

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
- `GET /api/v1/auth/me` -> returns authenticated Clerk user payload
- `GET /api/v1/products` -> paginated products list
- `GET /api/v1/products/:productId` -> product details
- `POST /api/v1/products` -> create product (requires Bearer token, role `SELLER` or `ADMIN`)

## 4) Mobile app integration

Use this backend base URL in your Expo app and send `Authorization: Bearer <Clerk session token>` for protected routes.

## 5) Next migration steps

- Add `users`, `orders`, `cart`, `checkout`, and `payments` routes.
- Use Clerk signup/login on frontend/mobile and keep backend auth verification via Clerk tokens.
- Add role-based authorization middleware per route.
- Add refresh tokens, rate limiting, and audit logs for production.
