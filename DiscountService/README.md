# DiscountService

Discount Service API for managing and applying discounts and promotions.

Features
- OAuth2 (authorization code flow) protected endpoints
- PostgreSQL persistence (discounts and discount applications)
- CRUD endpoints for discounts
- Apply discount endpoint
- Swagger UI at /docs with dynamic server URL
- Health endpoint at /

Requirements
- Node.js 18+
- PostgreSQL
- Environment variables set (see .env.example)

Getting Started
1. Copy .env.example to .env and adjust values.
2. Install dependencies:
   npm install
3. Run database migration:
   npm run db:migrate
4. (Optional) Seed sample data:
   npm run db:seed
5. Start the service:
   npm run dev
   # or
   npm start

API Docs
- OpenAPI/Swagger UI: http://localhost:3000/docs

Security
- OAuth2 via Authorization header: Authorization: Bearer <token>
- JWKS validation supported through OAUTH2_JWKS_URI. If not provided, HS256 with OAUTH2_JWT_SECRET is used (development only).

Database Schema
- discounts: stores discount definitions
- discount_applications: records each application of a discount to a cart

Notes
- BOGO discounts require item-level context and are recorded without calculating a monetary amount. Cart service should compute line-item effects.
- Percentage/fixed discounts accept optional cartTotal query param on /apply-discount to compute an amount.

License
- MIT
