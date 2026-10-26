
import path from "node:path";
import { fileURLToPath } from "node:url";

import { readJson, writeJsonAtomic } from "./jsonHandler.js";
import { validateProducts } from "./validation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_FILE = path.join(
  __dirname,
  "..",
  "data",
  "products.json"
);

// Read and validate all products
export async function getAllProducts() {
  const products = await readJson(PRODUCTS_FILE);
  validateProducts(products);
  return products;
}

// Search products by ID or name
export async function searchProducts(searchTerm) {
  const products = await getAllProducts();
  const term = String(searchTerm).trim().toLowerCase();

  return products.filter(
    (product) =>
      product.id.toLowerCase().includes(term) ||
      product.name.toLowerCase().includes(term)
  );
}

// Filter products by category
export async function filterByCategory(category) {
  const products = await getAllProducts();
  const term = String(category).trim().toLowerCase();

  return products.filter(
    (product) => product.category.toLowerCase() === term
  );
}

// Filter products by price range
export async function filterByPrice(minPrice, maxPrice) {
  if (
    !Number.isFinite(minPrice) ||
    !Number.isFinite(maxPrice) ||
    minPrice < 0 ||
    maxPrice < minPrice
  ) {
    throw new Error("Invalid price range.");
  }

  const products = await getAllProducts();

  return products.filter(
    (product) =>
      product.price >= minPrice &&
      product.price <= maxPrice
  );
}

// Find products that need restocking
export async function getLowStockProducts() {
  const products = await getAllProducts();

  return products.filter(
    (product) => product.stock <= product.reorderLevel
  );
}

// Calculate the total value of current inventory
export async function calculateInventoryValue() {
  const products = await getAllProducts();

  return products.reduce(
    (total, product) => total + product.price * product.stock,
    0
  );
}

// Update stock by a quantity change
export async function updateStock(productId, quantityChange) {
  if (!Number.isInteger(quantityChange)) {
    throw new Error("Stock change must be an integer.");
  }

  const products = await getAllProducts();
  const product = products.find((item) => item.id === productId);

  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const updatedStock = product.stock + quantityChange;

  if (updatedStock < 0) {
    throw new Error("Insufficient stock. Stock cannot become negative.");
  }

  product.stock = updatedStock;

  // Validate before saving
  validateProducts(products);
  await writeJsonAtomic(PRODUCTS_FILE, products);

  return product;
}

// Add a new product
export async function addProduct(newProduct) {
  const products = await getAllProducts();

  validateProducts([...products, newProduct]);

  await writeJsonAtomic(PRODUCTS_FILE, [
    ...products,
    newProduct
  ]);

  return newProduct;
}
