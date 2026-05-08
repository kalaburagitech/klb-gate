# KLB Gate Documentation

## 📂 Project Structure
- **/backend**: Node.js Express API. Handles business logic, database, and auth.
- **/dashboard**: Next.js Admin Dashboard. High-level management for Super Admins.
- **/mobile**: Expo React Native app. Primary tool for Guards and Residents.
- **/docs**: System architecture, API specs, and setup guides.
  
## 🚀 Getting Started

### 1. Database Setup
- Ensure PostgreSQL is running.
- In `/backend`, copy `.env.example` to `.env`.
- Update `DATABASE_URL`.
- Run migrations: `npx prisma migrate dev`.

### 2. Run Backend
- `npm run dev` (from /backend).

### 3. Run Mobile
- `npx expo start` (from /mobile).

### 4. Run Admin Dashboard (Web)
- *Coming Soon / Under Development*.

## 🔑 Default Roles
- **SUPER_ADMIN**: Manage organizations.
- **ORG_ADMIN**: Manage specific company tenants.
- **TENANT_ADMIN**: Manage society/apartment users.
- **GUARD**: Operation access (Check-in/Check-out).
- **RESIDENT**: View entry logs for their unit.
