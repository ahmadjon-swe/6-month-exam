# 🛒 Online Shop — Express.js & React

A full-stack e-commerce web application built with **Express.js + TypeScript** on the backend and **React + TypeScript** on the frontend.

---

## ✨ Features

- **Authentication** — Register / Login with OTP email verification, forgot & reset password, JWT access + refresh tokens
- **Role-based Access Control** — `user`, `seller`, and `admin` roles
- **Products** — Browse, filter, view details; sellers can create / edit / delete products with image uploads
- **Cart** — Add, update quantity, and remove items
- **Wishlist** — Save favourite products
- **Orders & Checkout** — Place orders with billing details
- **Seller Dashboard** — Manage your own product listings
- **Swagger API Docs** — Auto-generated at `/api-docs`
- **Static File Serving** — Uploaded product images served from `/uploads`

---

## 🏗️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| Database | PostgreSQL via Sequelize ORM |
| Auth | JWT (access + refresh tokens), bcryptjs |
| Validation | Joi |
| File Uploads | Multer |
| Email | Nodemailer (Gmail SMTP) |
| API Docs | Swagger UI + YAML |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Routing | React Router DOM v7 |
| State Management | Zustand |
| Server State | TanStack React Query |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| Icons | Lucide React |

---

## 📁 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── services/          # Business logic
│   │   ├── models/            # Sequelize models
│   │   ├── routes/            # Express routers
│   │   ├── middleware/        # Auth, error handling, file upload
│   │   ├── validators/        # Joi schemas
│   │   ├── utils/             # DB, JWT, email helpers
│   │   ├── enums/             # Roles, categories, order statuses
│   │   └── index.ts           # App entry point
│   ├── swagger/
│   │   └── documentation.yml  # OpenAPI spec
│   └── public/uploads/        # Uploaded product images
│
└── client/
    └── src/
        ├── api/               # Axios instance + API calls
        ├── components/        # Reusable UI components
        ├── pages/             # Page components
        ├── store/             # Zustand stores
        ├── hooks/             # Custom hooks
        ├── context/           # React context
        ├── types/             # TypeScript types
        └── utils/             # Helper utilities
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm or yarn

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/online-shop.git
cd online-shop
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=60d

# Email (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Client
CLIENT_URL=http://localhost:5173
```

> **Note:** For `EMAIL_PASS`, use a [Gmail App Password](https://myaccount.google.com/apppasswords), not your regular Gmail password.

Start the development server:

```bash
npm run dev
```

The server will start at `http://localhost:5000`.  
Swagger docs will be available at `http://localhost:5000/api-docs`.

---

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The client will start at `http://localhost:5173`.

---

## 📡 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/verify-register` | Verify registration OTP |
| POST | `/login` | Login |
| POST | `/verify-login` | Verify login OTP |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset password with token |
| POST | `/refresh-token` | Refresh access token |
| POST | `/logout` | Logout (protected) |

### Products — `/api/products`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | List all products | — |
| GET | `/most-sold` | Most sold products | — |
| GET | `/discounted` | Discounted products | — |
| GET | `/:id` | Product detail | — |
| POST | `/` | Create product (with images) | ✅ |
| PUT | `/:id` | Update product | ✅ |
| DELETE | `/:id` | Delete product | ✅ |

### Other Protected Routes
| Prefix | Description |
|---|---|
| `/api/cart` | Manage shopping cart |
| `/api/wishlist` | Manage wishlist |
| `/api/orders` | Place and view orders |
| `/api/users` | User profile & billing |

---

## 🔐 User Roles

| Role | Permissions |
|---|---|
| `user` | Browse products, manage cart/wishlist, place orders |
| `seller` | All user permissions + create/edit/delete own products, access dashboard |
| `admin` | Full access |

---

## 🖥️ Frontend Pages

| Route | Page | Auth Required |
|---|---|---|
| `/` | Home | — |
| `/products` | Products list | — |
| `/products/:id` | Product detail | — |
| `/register` | Register | — |
| `/login` | Login | — |
| `/cart` | Cart | ✅ |
| `/wishlist` | Wishlist | ✅ |
| `/checkout` | Checkout | ✅ |
| `/orders` | My orders | ✅ |
| `/profile` | Profile | ✅ |
| `/dashboard` | Seller dashboard | ✅ seller/admin |
| `/dashboard/new-product` | Create product | ✅ seller/admin |
| `/dashboard/edit-product/:id` | Edit product | ✅ seller/admin |

---

## 📦 Scripts

### Backend
```bash
npm run dev      # Start dev server with hot-reload
npm run build    # Compile TypeScript
npm run start    # Run compiled production build
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 📄 License

This project is licensed under the MIT License.
