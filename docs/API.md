
# API Documentation

## Industrial Sales & Inventory Management System

**Backend:** Node.js and Express.js  
**Database:** PostgreSQL  
**Base URL:** `http://localhost:5000/api`  
**API format:** REST API with JSON

## 1. Authentication

The application uses JWT authentication.

Protected API requests must include the following header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

`YOUR_JWT_TOKEN` is a placeholder. Obtain a token by logging in. Never upload a real token or password to GitHub.

### Login

**Endpoint**

```http
POST /api/auth/login
```

Example request:

```json
{
  "email": "your_registered_email@example.com",
  "password": "YOUR_PASSWORD"
}
```

The API authenticates the user and returns the information required by the frontend, including a JWT.

### Register User

```http
POST /api/auth/register
```

Access: ADMIN

This endpoint is used to register application users. Registration requires administrator authorization.

## 2. API Endpoint Summary

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | User login |
| POST | /api/auth/register | Register user |
| GET | /api/enquiries | Get all enquiries |
| POST | /api/enquiries | Create enquiry |
| GET | /api/enquiries/:id | Get enquiry details |
| GET | /api/quotations | Get all quotations |
| POST | /api/quotations | Create quotation |
| PATCH | /api/quotations/:id/accept | Accept quotation |
| GET | /api/orders | Get sales orders |
| POST | /api/orders | Create sales order |
| PATCH | /api/orders/:id/confirm | Confirm sales order |
| GET | /api/inventory | View inventory |
| POST | /api/dispatches | Create dispatch |

The Customers module also has backend endpoints. Refer to `backend/routes/customerRoutes.js` for its exact routes.

## 3. Enquiry APIs

### Get All Enquiries

```http
GET /api/enquiries
```

Returns the list of customer enquiries.

### Get Enquiry Details

```http
GET /api/enquiries/1
```

Returns enquiry details, including the requested products and quantities.

### Create Enquiry

```http
POST /api/enquiries
```

Creates an enquiry for an existing customer with one or more products.

The enquiry is initially assigned `NEW` status.

Refer to `backend/controllers/enquiryController.js` for the exact request fields.

## 4. Quotation APIs

### Get All Quotations

```http
GET /api/quotations
```

Returns quotation details such as:

- Quotation number
- Customer name
- Enquiry number
- Quotation date
- Validity date
- Grand total
- Status

### Create Quotation

```http
POST /api/quotations
```

Example request:

```json
{
  "enquiry_id": 1,
  "valid_until": "2026-12-31",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 18500,
      "discount_percent": 5,
      "gst_percent": 18
    }
  ]
}
```

Use an existing NEW enquiry. Product IDs and quantities must match the selected enquiry.

**Quotation calculation**

```text
Subtotal = Quantity × Unit Price

Discount = Subtotal × Discount Percentage / 100

Taxable Amount = Subtotal - Discount

GST = Taxable Amount × GST Percentage / 100

Line Amount = Taxable Amount + GST

Grand Total = Sum of all line amounts
```

All calculations are performed on the backend.

A newly created quotation has `DRAFT` status.

### Accept Quotation

```http
PATCH /api/quotations/1/accept
```

Changes a valid DRAFT quotation to ACCEPTED.

The quotation must not be expired.

## 5. Sales Order APIs

### Get Sales Orders

```http
GET /api/orders
```

Returns sales orders with their order numbers, customer names, totals and statuses.

### Create Sales Order

```http
POST /api/orders
```

Example request:

```json
{
  "quotation_id": 1
}
```

A sales order can be created only from an ACCEPTED quotation.

The backend prevents duplicate sales orders from being created for the same quotation.

The initial order status is `PENDING`.

### Confirm Sales Order

```http
PATCH /api/orders/1/confirm
```

The backend checks available inventory and reserves the quantities required by the sales order.

If sufficient stock is unavailable, confirmation is rejected.

A successfully confirmed order receives `CONFIRMED` status.

## 6. Inventory API

### Get Inventory

```http
GET /api/inventory
```

Example response:

```json
{
  "inventory": [
    {
      "product_id": 1,
      "product_name": "Three Phase Industrial Motor",
      "product_code": "MOT-001",
      "physical_quantity": 100,
      "reserved_quantity": 5,
      "available_quantity": 95
    }
  ]
}
```

This is an illustrative response. Actual stock values depend on the orders processed.

The available quantity is calculated as:

```text
available_quantity = physical_quantity - reserved_quantity
```

## 7. Dispatch API

### Create Dispatch

```http
POST /api/dispatches
```

Example request:

```json
{
  "sales_order_id": 1,
  "vehicle_number": "MH-01-AB-1234",
  "driver_name": "Demo Driver"
}
```

**Conditions**

- The sales order must be CONFIRMED.
- The vehicle number is required.
- The driver name is optional in the current backend.
- The order must have valid reserved stock.

**Successful operation**

The backend:

1. Creates a dispatch record.
2. Saves the dispatched products and quantities.
3. Deducts the quantities from physical stock.
4. Deducts the quantities from reserved stock.
5. Changes the sales order status to DISPATCHED.

All related database updates are performed inside a transaction.

## 8. Common HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Invalid request |
| 401 | Authentication required or invalid token |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict, such as insufficient stock or duplicate order |
| 500 | Internal server error |

Exact responses depend on the controller and endpoint.

## 9. Complete API Testing Workflow

Use Thunder Client or Postman to test the application.

1. Log in and obtain a JWT.
2. Create or select a customer.
3. Create an enquiry with products and quantities.
4. Create a quotation for the enquiry.
5. Accept the quotation.
6. Convert it into a sales order.
7. View inventory before confirmation.
8. Confirm the sales order.
9. View inventory to verify reserved stock.
10. Dispatch the confirmed order.
11. View inventory again to verify stock deduction.

## 10. Security

The backend uses:

- JWT authentication
- bcrypt password hashing
- Protected API routes
- Role-based authorization
- Parameterized PostgreSQL queries
- Database transactions for critical operations

Real passwords, JWT tokens and `.env` files must never be committed to the repository.