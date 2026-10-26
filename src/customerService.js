
import path from "node:path";
import { fileURLToPath } from "node:url";

import { readJson } from "./jsonHandler.js";
import { validateCustomers } from "./validation.js";
import { getAllProducts } from "./productService.js";
import { calculateOrderTotal } from "./orderService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CUSTOMERS_FILE = path.join(
  __dirname,
  "..",
  "data",
  "customers.json"
);

const ORDERS_FILE = path.join(
  __dirname,
  "..",
  "data",
  "orders.json"
);

// Get all customers
export async function getAllCustomers() {
  const customers = await readJson(CUSTOMERS_FILE);
  validateCustomers(customers);
  return customers;
}

// Find a customer by ID
export async function getCustomerById(customerId) {
  const customers = await getAllCustomers();

  const customer = customers.find(
    (item) => item.id === customerId
  );

  if (!customer) {
    throw new Error(`Customer not found: ${customerId}`);
  }

  return customer;
}

// Calculate spending for every customer
export async function getCustomerSpending() {
  const customers = await getAllCustomers();
  const orders = await readJson(ORDERS_FILE);
  const products = await getAllProducts();

  const spending = [];

  for (const customer of customers) {
    let totalSpent = 0;

    for (const order of orders) {
      // Cancelled orders are not counted as spending
      if (
        order.customerId === customer.id &&
        order.status !== "cancelled"
      ) {
        totalSpent += calculateOrderTotal(order, products);
      }
    }

    spending.push({
      customerId: customer.id,
      customerName: customer.name,
      totalSpent: Number(totalSpent.toFixed(2))
    });
  }

  return spending;
}

// Find the customer with the most orders
export async function getTopCustomerByOrders() {
  const customers = await getAllCustomers();
  const orders = await readJson(ORDERS_FILE);

  const orderCounts = customers.map((customer) => {
    const count = orders.filter(
      (order) =>
        order.customerId === customer.id &&
        order.status !== "cancelled"
    ).length;

    return {
      customerId: customer.id,
      customerName: customer.name,
      totalOrders: count
    };
  });

  orderCounts.sort(
    (a, b) => b.totalOrders - a.totalOrders
  );

  return orderCounts[0] ?? null;
}

// Get the spending of one customer
export async function getCustomerSpendingById(customerId) {
  const customer = await getCustomerById(customerId);
  const spending = await getCustomerSpending();

  return spending.find(
    (item) => item.customerId === customer.id
  );
}
