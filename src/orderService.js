
import path from "node:path";
import { fileURLToPath } from "node:url";

import { readJson, writeJsonAtomic } from "./jsonHandler.js";
import {
  validateProducts,
  validateCustomers,
  validateOrder
} from "./validation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "..", "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const CUSTOMERS_FILE = path.join(DATA_DIR, "customers.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

// Read and validate all data
async function readValidatedData() {
  const [products, customers, orders] = await Promise.all([
    readJson(PRODUCTS_FILE),
    readJson(CUSTOMERS_FILE),
    readJson(ORDERS_FILE)
  ]);

  validateProducts(products);
  validateCustomers(customers);

  const orderIds = new Set();

  for (const order of orders) {
    validateOrder(
      order,
      products,
      customers,
      Array.from(orderIds, (id) => ({ id }))
    );
    orderIds.add(order.id);
  }

  return { products, customers, orders };
}

// Calculate one order total after discount
export function calculateOrderTotal(order, products) {
  const subtotal = order.items.reduce((total, item) => {
    const product = products.find(
      (product) => product.id === item.productId
    );

    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    return total + product.price * item.quantity;
  }, 0);

  const discount = subtotal * (order.discount / 100);

  return Number((subtotal - discount).toFixed(2));
}

// Get all orders
export async function getAllOrders() {
  const { orders } = await readValidatedData();
  return orders;
}

// Get an order by ID
export async function getOrderById(orderId) {
  const orders = await getAllOrders();

  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  return order;
}

// Calculate totals for all orders
export async function getOrderTotals() {
  const { products, orders } = await readValidatedData();

  return orders.map((order) => ({
    orderId: order.id,
    customerId: order.customerId,
    status: order.status,
    total: calculateOrderTotal(order, products)
  }));
}

// Calculate sales between two dates
export async function getSalesByDateRange(startDate, endDate) {
  if (
    !isValidDate(startDate) ||
    !isValidDate(endDate) ||
    startDate > endDate
  ) {
    throw new Error("Please provide a valid date range.");
  }

  const { products, orders } = await readValidatedData();

  const matchingOrders = orders.filter(
    (order) =>
      order.date >= startDate &&
      order.date <= endDate &&
      order.status !== "cancelled"
  );

  return {
    startDate,
    endDate,
    orderCount: matchingOrders.length,
    totalSales: Number(
      matchingOrders
        .reduce(
          (total, order) =>
            total + calculateOrderTotal(order, products),
          0
        )
        .toFixed(2)
    )
  };
}

// Validate YYYY-MM-DD calendar dates
function isValidDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

// Create an order and reduce stock
export async function createOrder(newOrder) {
  const { products, customers, orders } =
    await readValidatedData();

  validateOrder(newOrder, products, customers, orders);

  if (newOrder.status !== "pending") {
    throw new Error("New orders must have pending status.");
  }

  // Check every item before changing any stock
  for (const item of newOrder.items) {
    const product = products.find(
      (product) => product.id === item.productId
    );

    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${product.stock}`
      );
    }
  }

  // Prepare changes in memory
  const updatedProducts = products.map((product) => {
    const quantityOrdered = newOrder.items
      .filter((item) => item.productId === product.id)
      .reduce((total, item) => total + item.quantity, 0);

    return {
      ...product,
      stock: product.stock - quantityOrdered
    };
  });

  const updatedOrders = [...orders, newOrder];

  // Save orders first, then products.
  // Restore the previous orders file if the product write fails.
  await writeJsonAtomic(ORDERS_FILE, updatedOrders);

  try {
    await writeJsonAtomic(PRODUCTS_FILE, updatedProducts);
  } catch (error) {
    try {
      await writeJsonAtomic(ORDERS_FILE, orders);
    } catch (rollbackError) {
      throw new Error(
        `Stock update failed and order rollback failed: ${rollbackError.message}`,
        { cause: error }
      );
    }

    throw error;
  }

  return newOrder;
}

// Cancel an order and restore stock exactly once
export async function cancelOrder(orderId) {
  const { products, orders } = await readValidatedData();

  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  if (order.status === "cancelled") {
    throw new Error("This order has already been cancelled.");
  }

  if (
    order.status === "shipped" ||
    order.status === "delivered"
  ) {
    throw new Error(
      "Shipped or delivered orders cannot be cancelled."
    );
  }

  const updatedProducts = products.map((product) => {
    const quantityToRestore = order.items
      .filter((item) => item.productId === product.id)
      .reduce((total, item) => total + item.quantity, 0);

    return {
      ...product,
      stock: product.stock + quantityToRestore
    };
  });

  const updatedOrders = orders.map((item) =>
    item.id === orderId
      ? { ...item, status: "cancelled" }
      : item
  );

  // Save updated inventory first, then order status.
  // Roll back inventory if updating the order file fails.
  await writeJsonAtomic(PRODUCTS_FILE, updatedProducts);

  try {
    await writeJsonAtomic(ORDERS_FILE, updatedOrders);
  } catch (error) {
    try {
      await writeJsonAtomic(PRODUCTS_FILE, products);
    } catch (rollbackError) {
      throw new Error(
        `Order cancellation failed and stock rollback failed: ${rollbackError.message}`,
        { cause: error }
      );
    }

    throw error;
  }

  return updatedOrders.find((item) => item.id === orderId);
}

// Report order counts by status
export async function getOrderStatusReport() {
  const orders = await getAllOrders();

  const report = {
    pending: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  };

  for (const order of orders) {
    report[order.status]++;
  }

  return report;
}

// Command-line interface
async function main() {
  const [command, ...args] = process.argv.slice(2);

  try {
    if (command === "list") {
      console.log(await getAllOrders());
    } else if (command === "totals") {
      console.log(await getOrderTotals());
    } else if (command === "report") {
      console.log(await getOrderStatusReport());
    } else if (command === "sales") {
      console.log(
        await getSalesByDateRange(args[0], args[1])
      );
    } else if (command === "cancel") {
      console.log(await cancelOrder(args[0]));
    } else {
      console.log(
        "Commands: list, totals, report, sales <startDate> <endDate>, cancel <orderId>"
      );
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === __filename;

if (isDirectExecution) {
  await main();
}
