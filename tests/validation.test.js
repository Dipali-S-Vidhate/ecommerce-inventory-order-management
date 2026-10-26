
import test from "node:test";
import assert from "node:assert/strict";

import {
  validateProducts,
  validateCustomers,
  validateOrder,
} from "../src/validation.js";

const validProduct = {
  id: "P900",
  name: "Test Laptop",
  category: "Electronics",
  price: 1000,
  stock: 10,
  reorderLevel: 2,
};

const validCustomer = {
  id: "C900",
  name: "Test Customer",
  email: "test@example.com",
  phone: "9876543210",
};

const validOrder = {
  id: "O900",
  customerId: "C900",
  items: [{ productId: "P900", quantity: 1 }],
  discount: 0,
  date: "2026-10-26",
  status: "pending",
};

const products = [validProduct];
const customers = [validCustomer];

test("valid product data passes validation", () => {
  assert.equal(validateProducts(products), true);
});

test("negative product price is rejected", () => {
  const invalidProduct = { ...validProduct, price: -100 };

  assert.throws(
    () => validateProducts([invalidProduct]),
    /price/i,
  );
});

test("duplicate product IDs are rejected", () => {
  const duplicateProducts = [
    validProduct,
    { ...validProduct, name: "Another Laptop" },
  ];

  assert.throws(
    () => validateProducts(duplicateProducts),
    /duplicate/i,
  );
});

test("valid customer data passes validation", () => {
  assert.equal(validateCustomers(customers), true);
});

test("invalid customer email is rejected", () => {
  const invalidCustomer = {
    ...validCustomer,
    email: "invalid-email",
  };

  assert.throws(
    () => validateCustomers([invalidCustomer]),
    /email/i,
  );
});

test("nonexistent product ID in an order is rejected", () => {
  const invalidOrder = {
    ...validOrder,
    items: [{ productId: "P999", quantity: 1 }],
  };

  assert.throws(
    () => validateOrder(invalidOrder, products, customers, []),
    /product/i,
  );
});

test("discount above 50 percent is rejected", () => {
  const invalidOrder = { ...validOrder, discount: 51 };

  assert.throws(
    () => validateOrder(invalidOrder, products, customers, []),
    /discount/i,
  );
});

test("zero quantity is rejected", () => {
  const invalidOrder = {
    ...validOrder,
    items: [{ productId: "P900", quantity: 0 }],
  };

  assert.throws(
    () => validateOrder(invalidOrder, products, customers, []),
    /quantity/i,
  );
});

test("invalid calendar date is rejected", () => {
  const invalidOrder = { ...validOrder, date: "2026-02-30" };

  assert.throws(
    () => validateOrder(invalidOrder, products, customers, []),
    /date/i,
  );
});

test("duplicate order ID is rejected", () => {
  assert.throws(
    () => validateOrder(validOrder, products, customers, [{ id: "O900" }]),
    /duplicate/i,
  );
});
