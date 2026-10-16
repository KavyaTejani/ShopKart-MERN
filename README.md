# ShopKart 

A full-stack **MERN** e-commerce application with customer accounts, product browsing, wishlists, a shopping cart, order history, and Razorpay checkout.

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Adding Products](#-adding-products)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Security](#-security)
- [License](#-license)

---

##  Features

| Area | Description |
|---|---|
| **Authentication** | Customer registration, login, logout, and password changes using JWT cookies |
| **Product Catalogue** | Browse products, search by name, filter by category, and view product details |
| **Wishlist** | Add, remove, and toggle saved products |
| **Shopping Cart** | Add products, change quantities, and remove products with stock checks |
| **Checkout** | Enter shipping details and review the order total |
| **Payments** | Razorpay checkout with server-side payment signature verification |
| **Orders** | View order history and order details; stock is deducted after successful payment |

---

##  Tech Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens and bcrypt
- **Payments:** Razorpay Node SDK

### Frontend

- **Library:** React
- **Build Tool:** Vite
- **Routing:** React Router
- **HTTP Client:** Axios
- **Styling:** CSS

---

##  Project Structure

```text
LAB/
├── backend/
│   ├── config/          # Razorpay configuration
│   ├── controllers/     # Customer, product, wishlist, cart, and order logic
│   ├── middlewares/     # Authentication middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # Express API routes
│   ├── utils/           # JWT helper functions
│   ├── index.js         # Backend entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Shared UI components
│   │   ├── context/     # Shared React state
│   │   ├── pages/       # App pages
│   │   └── services/    # API client
│   ├── vercel.json
│   └── package.json
└── README.md
```

---

##  Getting Started

### Requirements

- **Node.js** and **npm**
- A **MongoDB** database, such as MongoDB Atlas
- **Razorpay** API keys for payment checkout

### 1. Set up the backend

```bash
cd backend
npm install
```

Create `backend/.env` using the variables listed below, then start the backend:

```bash
npm run dev
```

The backend runs on `http://localhost:4001` by default.

### 2. Set up the frontend

Open a second terminal from the project directory:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

---

##  Environment Variables

### Backend — `backend/.env`

| Variable | Description |
|---|---|
| `DB_URL` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `PORT` | Backend port; defaults to `4001` locally |
| `CLIENT_URL` | Frontend origin allowed by CORS, such as `http://localhost:5173` |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay secret; keep this on the backend |
| `NODE_ENV` | Set to `production` when deployed |

Example with placeholders:

```env
DB_URL=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
PORT=4001
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NODE_ENV=development
```

### Frontend

Set `VITE_API_URL` to the backend base URL when it differs from the local default:

```env
VITE_API_URL=http://localhost:4001
```

Do not commit `.env` files or publish secret values.

---

##  Adding Products

Products can be added through the API. For example, send a `POST` request to `http://localhost:4001/products` with JSON like:

```json
{
  "name": "Sample Product",
  "description": "A short product description",
  "price": 2999,
  "category": "Electronics",
  "image": "https://example.com/product.jpg",
  "stock": 25
}
```

---

##  API Reference

All routes are prefixed by the resource path.  indicates a route that requires authentication.

### Customers — `/customers`

| Method | Route | Auth | Description |
|---|---|:---:|---|
| POST | `/register` | | Create a customer account |
| POST | `/login` | | Log in and set the authentication cookie |
| POST | `/logout` | | Clear the authentication cookie |
| GET | `/me` |  | Get the current customer's profile |
| PATCH | `/change-password` |  | Change the account password |

### Products — `/products`

| Method | Route | Auth | Description |
|---|---|:---:|---|
| GET | `/` | | List products; supports `?search=` and `?category=` |
| GET | `/:id` | | Get product details |
| POST | `/` | | Create a product |

### Wishlist — `/wishlist` 

| Method | Route | Description |
|---|---|---|
| GET | `/` | Get saved products |
| POST | `/:productId` | Add a product |
| DELETE | `/:productId` | Remove a product |
| PATCH | `/:productId/toggle` | Toggle a product in the wishlist |

### Cart — `/cart` 

| Method | Route | Description |
|---|---|---|
| GET | `/` | Get the current cart |
| POST | `/:productId` | Add a product to the cart |
| PATCH | `/:productId` | Update the quantity |
| DELETE | `/:productId` | Remove a product from the cart |

### Orders — `/orders` 

| Method | Route | Description |
|---|---|---|
| POST | `/create-payment-order` | Validate cart and stock, then create a Razorpay order |
| POST | `/verify-payment` | Verify payment and place the order |
| GET | `/` | List the current customer's orders |
| GET | `/:id` | Get an order's details |

---

##  Deployment

- Deploy `frontend` to **Vercel** and set `VITE_API_URL` to the Render backend URL, for example `https://your-service.onrender.com`.
- Deploy `backend` to **Render** and set its environment variables in the Render dashboard.
- Set `CLIENT_URL` on Render to the Vercel site origin, for example `https://your-site.vercel.app`.
- If using MongoDB Atlas, allow the Render service's outbound IP ranges in the Atlas IP access list.

---

##  Security

- Passwords are hashed before storage.
- Authentication tokens are stored in HttpOnly cookies.
- Payment signatures are verified by the backend before an order is marked paid.
- Order totals and product stock are checked by the backend during checkout.
- Keep database credentials, JWT secrets, and Razorpay secrets private.

---

##  License

For academic use.
