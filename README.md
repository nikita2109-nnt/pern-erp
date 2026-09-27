
# Industrial Sales & Inventory Management System

A full-stack web application developed using the PERN stack (PostgreSQL, Express.js, React.js and Node.js).

The system manages the sales workflow of an industrial products business, from customer enquiries and quotations to sales orders, inventory reservation and dispatch.

## Tech Stack

### Frontend
- React.js with Vite
- JavaScript
- CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt

### Development Tools
- Visual Studio Code
- pgAdmin
- Thunder Client
- Git and GitHub

## Features

### Authentication
- User login using JWT authentication
- Password hashing using bcrypt
- Protected API routes
- Role-based access for ADMIN and SALES_USER

### Customer Management
- Create and view customer records
- Maintain customer information for sales enquiries

### Enquiry Management
- Create customer enquiries
- Add products and required quantities
- View enquiry details and status

### Quotation Management
- Generate quotations from enquiries
- Calculate discounts, GST and grand totals on the backend
- Set quotation validity dates
- View and accept quotations

### Sales Order Management
- Convert accepted quotations into sales orders
- View sales orders and their statuses
- Confirm orders and reserve inventory
- Prevent duplicate sales orders for the same quotation

### Inventory Management
- View physical, reserved and available stock
- Prevent reservations that exceed available stock

Available Stock = Physical Stock - Reserved Stock

### Dispatch Management
- Dispatch confirmed sales orders
- Record vehicle number and driver name
- Deduct dispatched quantities from physical and reserved stock
- Update the sales order status after dispatch

## Project Structure

    pern/
    ├── backend/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── routes/
    │   ├── .env.example
    │   ├── package.json
    │   └── server.js
    ├── frontend/
    │   ├── src/
    │   ├── package.json
    │   └── index.html
    ├── database/
    │   └── schema.sql
    ├── docs/
    │   ├── DATABASE.md
    │   └── API.md
    └── README.md

## Prerequisites

Install the following software:

- Node.js and npm
- PostgreSQL
- pgAdmin (optional)
- Git

## Installation and Setup

### 1. Clone the Repository

    git clone https://github.com/nikita2109-nnt/pern-erp.git
    cd pern-erp

### 2. Set Up PostgreSQL

Create a PostgreSQL database named:

    per_erp

Open pgAdmin, select the database and execute:

    database/schema.sql

Run the project's seed script, if included, to insert initial data.

### 3. Configure the Backend

Open a terminal in the backend directory:

    cd backend
    npm install

Create a `.env` file in the backend directory using `.env.example` as a reference.

Example configuration:

    PORT=5000
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=per_erp
    DB_USER=postgres
    DB_PASSWORD=your_postgresql_password
    JWT_SECRET=replace_with_a_long_random_secret

Make sure the variable names match your `backend/config/db.js` file.

Never upload your `.env` file or actual passwords to GitHub.

### 4. Start the Backend

From the backend directory:

    npm run dev

Backend URL:

    http://localhost:5000

### 5. Start the Frontend

Open another terminal from the project root:

    cd frontend
    npm install
    npm run dev

Frontend URL:

    http://localhost:5173

Open the frontend URL in your browser.

## Application Workflow

1. Log in using an authorized account.
2. Create a customer and a new enquiry.
3. Generate a quotation for the enquiry.
4. Accept the quotation.
5. Convert the accepted quotation into a sales order.
6. Confirm the order to reserve inventory.
7. Dispatch the confirmed order.
8. Verify that physical and reserved stock are updated.

## Database

The application uses PostgreSQL with 12 main tables:

- users
- customers
- products
- inventory
- enquiries
- enquiry_items
- quotations
- quotation_items
- sales_orders
- sales_order_items
- dispatches
- dispatch_items

## API Overview

All application API routes are prefixed with `/api`.

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | Log in |
| POST | /api/auth/register | Register a user (ADMIN) |
| GET | /api/enquiries | View enquiries |
| POST | /api/enquiries | Create enquiry |
| GET | /api/enquiries/:id | View enquiry details |
| GET | /api/quotations | View quotations |
| POST | /api/quotations | Create quotation |
| PATCH | /api/quotations/:id/accept | Accept quotation |
| GET | /api/orders | View sales orders |
| POST | /api/orders | Create sales order |
| PATCH | /api/orders/:id/confirm | Confirm order |
| GET | /api/inventory | View inventory |
| POST | /api/dispatches | Dispatch an order |

Protected endpoints require a JWT token:

    Authorization: Bearer YOUR_JWT_TOKEN

## Security and Data Integrity

- Passwords are hashed using bcrypt.
- JWT is used for authentication.
- Protected routes use authentication middleware.
- Database transactions are used for critical operations.
- Inventory reservation checks prevent over-reservation.
- Dispatch operations update inventory and order status together.

## Documentation

- [Database Documentation and ER Diagram](docs/DATABASE.md)
- [API Documentation](docs/API.md)
- [Database Schema](database/schema.sql)

## Author

Nikita Thakur

## Project Type

Full-Stack PERN Technical Case Study