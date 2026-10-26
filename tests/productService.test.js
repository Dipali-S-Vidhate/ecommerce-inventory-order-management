
import test from "node:test";
import assert from "node:assert/strict";

import {
  getAllProducts,
  searchProducts,
  filterByCategory,
  filterByPrice,
  getLowStockProducts,
  calculateInventoryValue,
  updateStock
} from "../src/productService.js";

test("products file contains at least 15 products", async () => {
  const products = await getAllProducts();

  assert.ok(products.length >= 15);
});

test("every product has a unique ID", async () => {
  const products = await getAllProducts();
  const ids = products.map((product) => product.id);

  assert.equal(new Set(ids).size, ids.length);
});

test("search finds Laptop by name", async () => {
  const results = await searchProducts("Laptop");

  assert.ok(results.some((product) => product.id === "P001"));
});

test("search is case-insensitive", async () => {
  const results = await searchProducts("laptop");

  assert.ok(results.some((product) => product.name === "Laptop"));
});

test("search finds a product by ID", async () => {
  const results = await searchProducts("P002");

  assert.ok(results.some((product) => product.name === "Wireless Mouse"));
});

test("category filter returns only Electronics products", async () => {
  const results = await filterByCategory("Electronics");

  assert.ok(results.length > 0);
  assert.ok(
    results.every((product) => product.category === "Electronics")
  );
});

test("category filter is case-insensitive", async () => {
  const results = await filterByCategory("electronics");

  assert.ok(results.length > 0);
});

test("price filter returns products within the given range", async () => {
  const results = await filterByPrice(500, 2000);

  assert.ok(
    results.every(
      (product) => product.price >= 500 && product.price <= 2000
    )
  );
});

test("price filter rejects an invalid range", async () => {
  await assert.rejects(
    filterByPrice(2000, 500),
    /Invalid price range/
  );
});

test("low-stock report includes the Microphone", async () => {
  const results = await getLowStockProducts();

  assert.ok(results.some((product) => product.id === "P015"));
});

test("inventory value is a non-negative number", async () => {
  const value = await calculateInventoryValue();

  assert.equal(typeof value, "number");
  assert.ok(Number.isFinite(value));
  assert.ok(value >= 0);
});

test("stock update rejects an unknown product", async () => {
  await assert.rejects(
    updateStock("P999", -1),
    /Product not found/
  );
});

test("stock update rejects fractional quantities", async () => {
  await assert.rejects(
    updateStock("P001", 1.5),
    /Stock change must be an integer/
  );
});

test("stock update rejects changes that cause negative stock", async () => {
  await assert.rejects(
    updateStock("P015", -100),
    /Insufficient stock/
  );
});
