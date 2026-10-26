
# E-Commerce Inventory and Order Management System

## 1. Project Overview

This project is a command-line E-Commerce Inventory and Order Management System built with Node.js and JavaScript.

It uses JSON files to store product, customer, and order records without requiring a database.

## 2. Technologies Used

- Node.js
- JavaScript ES Modules
- JSON
- Node.js built-in test runner
- ESLint

## 3. Project Structure

```text
ecommerce-system/
├── data/
│   ├── products.json
│   ├── customers.json
│   └── orders.json
├── src/
│   ├── jsonHandler.js
│   ├── validation.js
│   ├── productService.js
│   ├── customerService.js
│   └── orderService.js
├── tests/
│   ├── productService.test.js
│   └── orderService.test.js
├── docs/
│   └── README.md
├── eslint.config.js
└── package.json
```

## 4. Setup Instructions

### Prerequisites

Install Node.js and npm.

Check the installation:

```bash
node --version
npm --version
```

### Install dependencies

Run this command from the project root:

```bash
npm install
```

## 5. Running the Application

List all orders:

```bash
npm start -- list
```

Display calculated order totals:

```bash
npm start -- totals
```

Display the order status report:

```bash
npm start -- report
```

Calculate sales for a date range:

```bash
npm start -- sales 2026-10-01 2026-10-22
```

Cancel an eligible pending order:

```bash
npm start -- cancel O005
```

Cancellation changes the order status and restores its product quantities. Shipped, delivered, and already-cancelled orders cannot be cancelled by this implementation.

## 6. Product Features

- Search products by ID or name.
- Filter products by category.
- Filter products by price range.
- Identify products at or below their reorder level.
- Calculate total inventory value.
- Update stock and reject negative stock.
- Add products with validation.

## 7. Customer Features

- Retrieve customer records.
- Find customers by ID.
- Calculate customer spending.
- Find the customer with the most non-cancelled orders.

## 8. Order Features

- Calculate order totals and discounts.
- Retrieve orders by ID.
- Generate order totals and status reports.
- Calculate sales over a date range.
- Validate customer and product references.
- Reject orders that exceed available stock.
- Cancel eligible orders and restore inventory.

## 9. JSON Data Handling

JSON is a lightweight text format suitable for storing structured records.

`JSON.parse()` converts JSON text into JavaScript values.

`JSON.stringify()` converts JavaScript values into JSON text.

The application reads JSON data asynchronously and writes updates through a temporary file followed by a rename operation.

Missing files and malformed JSON are reported as errors rather than silently replaced with empty data.

## 10. Validation

The application validates:

- Unique product, customer, and order IDs.
- Non-negative product prices and stock quantities.
- Positive integer quantities in order items.
- Existing customer and product references.
- Discounts between 0% and 50%.
- Valid order dates and order statuses.
- Customer email formats.

## 11. Testing

Run the automated tests:

```bash
npm test
```

The tests use Node.js's built-in test runner.

Run ESLint:

```bash
npm run lint
```

Attempt supported automatic fixes:

```bash
npm run lint:fix
```

Review all remaining errors manually.

## 12. JSON Limitations

JSON files are useful for learning and small demonstrations, but they have important limitations:

- They do not provide database transactions.
- They do not automatically prevent simultaneous updates from overwriting each other.
- Searching and updating large files can be inefficient.
- File permissions, disk failures, and process interruptions can affect writes.
- Updating separate files cannot be guaranteed to succeed as one atomic transaction.

The temporary-file approach reduces the risk of partially writing a single file, but it does not provide full transaction safety.

For a production e-commerce application, use a transactional database such as MySQL or PostgreSQL and implement appropriate transaction handling and concurrency controls.

## 13. Future Improvements

- Build a web frontend.
- Add user authentication and role-based authorization.
- Add pagination and sorting.
- Add structured application logging.
- Add isolated tests for successful order creation, stock restoration, and simulated file-write failures.
- Replace JSON storage with a transactional database.

## 14. Conclusion

This project demonstrates JSON file handling, asynchronous programming, validation, array operations, inventory management, order processing, error handling, automated testing, and code quality checks using Node.js.
