
import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateOrderTotal,
  getAllOrders,
  getOrderById,
  getOrderTotals,
  getSalesByDateRange,
  getOrderStatusReport,
  createOrder,
  cancelOrder
} from "../src/orderService.js";

test("orders file contains at least 10 orders", async () => {
  const orders = await getAllOrders();

  assert.ok(orders.length >= 10);
});

test("every order has a unique ID", async () => {
  const orders = await getAllOrders();
  const ids = orders.map((order) => order.id);

  assert.equal(new Set(ids).size, ids.length);
});

test("getOrderById finds an existing order", async () => {
  const order = await getOrderById("O001");

  assert.equal(order.id, "O001");
});

test("getOrderById rejects an unknown order", async () => {
  await assert.rejects(
    getOrderById("O999"),
    /Order not found/
  );
});

test("calculateOrderTotal applies the discount correctly", () => {
  const order = {
    id: "TEST001",
    items: [
      { productId: "P001", quantity: 1 },
      { productId: "P002", quantity: 2 }
    ],
    discount: 10
  };

  const products = [
    { id: "P001", price: 1000 },
    { id: "P002", price: 500 }
  ];

  // Subtotal = 1000 + (2 * 500) = 2000
  // Discount = 10% of 2000 = 200
  assert.equal(calculateOrderTotal(order, products), 1800);
});

test("calculateOrderTotal rejects an unknown product", () => {
  const order = {
    id: "TEST002",
    items: [{ productId: "P999", quantity: 1 }],
    discount: 0
  };

  assert.throws(
    () => calculateOrderTotal(order, []),
    /Product not found/
  );
});

test("order totals include an amount for each order", async () => {
  const totals = await getOrderTotals();

  assert.ok(totals.length >= 10);

  assert.ok(
    totals.every(
      (item) =>
        typeof item.total === "number" &&
        Number.isFinite(item.total) &&
        item.total >= 0
    )
  );
});

test("date-range sales returns valid summary data", async () => {
  const result = await getSalesByDateRange(
    "2026-10-01",
    "2026-10-22"
  );

  assert.equal(result.startDate, "2026-10-01");
  assert.equal(result.endDate, "2026-10-22");
  assert.ok(result.orderCount >= 0);
  assert.ok(result.totalSales >= 0);
});

test("date-range sales rejects an invalid date range", async () => {
  await assert.rejects(
    getSalesByDateRange("2026-10-22", "2026-10-01"),
    /valid date range/
  );
});

test("status report contains all order statuses", async () => {
  const report = await getOrderStatusReport();

  assert.ok(Number.isInteger(report.pending));
  assert.ok(Number.isInteger(report.shipped));
  assert.ok(Number.isInteger(report.delivered));
  assert.ok(Number.isInteger(report.cancelled));
});

test("creating an order rejects an unknown customer", async () => {
  const order = {
    id: "TEST-CUSTOMER",
    customerId: "C999",
    items: [{ productId: "P001", quantity: 1 }],
    discount: 0,
    date: "2026-10-26",
    status: "pending"
  };

  await assert.rejects(
    createOrder(order),
    /Customer not found/
  );
});

test("cancelling a nonexistent order fails", async () => {
  await assert.rejects(
    cancelOrder("O999"),
    /Order not found/
  );
});

test("cancelling an already-cancelled order fails", async () => {
  await assert.rejects(
    cancelOrder("O009"),
    /already been cancelled/
  );
});

test("cancelling a shipped order fails", async () => {
  await assert.rejects(
    cancelOrder("O003"),
    /cannot be cancelled/
  );
});
