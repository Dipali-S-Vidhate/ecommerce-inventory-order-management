
const VALID_ORDER_STATUSES = [
  "pending",
  "shipped",
  "delivered",
  "cancelled"
];

const MAX_DISCOUNT = 50;

// Check whether a value is a non-empty string
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

// Check for duplicate IDs
function hasDuplicateIds(records) {
  const ids = records.map((record) => record.id);
  return new Set(ids).size !== ids.length;
}

// Validate the complete products array
export function validateProducts(products) {
  if (!Array.isArray(products)) {
    throw new Error("Products data must be an array.");
  }

  if (hasDuplicateIds(products)) {
    throw new Error("Duplicate product IDs found.");
  }

  for (const product of products) {
    if (!isNonEmptyString(product.id)) {
      throw new Error("Every product must have a valid ID.");
    }

    if (!isNonEmptyString(product.name)) {
      throw new Error(`Product ${product.id} must have a name.`);
    }

    if (!isNonEmptyString(product.category)) {
      throw new Error(`Product ${product.id} must have a category.`);
    }

    if (
      typeof product.price !== "number" ||
      !Number.isFinite(product.price) ||
      product.price < 0
    ) {
      throw new Error(
        `Product ${product.id} must have a non-negative price.`
      );
    }

    if (
      !Number.isInteger(product.stock) ||
      product.stock < 0
    ) {
      throw new Error(
        `Product ${product.id} must have a non-negative integer stock.`
      );
    }

    if (
      !Number.isInteger(product.reorderLevel) ||
      product.reorderLevel < 0
    ) {
      throw new Error(
        `Product ${product.id} must have a non-negative integer reorder level.`
      );
    }
  }

  return true;
}

// Validate the complete customers array
export function validateCustomers(customers) {
  if (!Array.isArray(customers)) {
    throw new Error("Customers data must be an array.");
  }

  if (hasDuplicateIds(customers)) {
    throw new Error("Duplicate customer IDs found.");
  }

  const emails = new Set();

  for (const customer of customers) {
    if (!isNonEmptyString(customer.id)) {
      throw new Error("Every customer must have a valid ID.");
    }

    if (!isNonEmptyString(customer.name)) {
      throw new Error(`Customer ${customer.id} must have a name.`);
    }

    if (
      typeof customer.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)
    ) {
      throw new Error(
        `Customer ${customer.id} must have a valid email.`
      );
    }

    const normalizedEmail = customer.email.toLowerCase();

    if (emails.has(normalizedEmail)) {
      throw new Error(`Duplicate customer email: ${customer.email}`);
    }

    emails.add(normalizedEmail);

    if (!isNonEmptyString(customer.phone)) {
      throw new Error(`Customer ${customer.id} must have a phone number.`);
    }
  }

  return true;
}

// Validate a single new product
export function validateNewProduct(product, existingProducts = []) {
  validateProducts([...existingProducts, product]);
  return true;
}

// Validate a single new customer
export function validateNewCustomer(customer, existingCustomers = []) {
  validateCustomers([...existingCustomers, customer]);
  return true;
}

// Validate a single order
export function validateOrder(order, products, customers, existingOrders = []) {
  if (!order || typeof order !== "object" || Array.isArray(order)) {
    throw new Error("Order must be a valid object.");
  }

  if (!isNonEmptyString(order.id)) {
    throw new Error("Order must have a valid ID.");
  }

  if (existingOrders.some((existing) => existing.id === order.id)) {
    throw new Error(`Duplicate order ID: ${order.id}`);
  }

  if (!customers.some((customer) => customer.id === order.customerId)) {
    throw new Error(`Customer not found: ${order.customerId}`);
  }

  if (!Array.isArray(order.items) || order.items.length === 0) {
    throw new Error(`Order ${order.id} must contain at least one item.`);
  }

  const productIds = new Set(products.map((product) => product.id));

  for (const item of order.items) {
    if (!productIds.has(item.productId)) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(
        `Quantity for product ${item.productId} must be a positive integer.`
      );
    }
  }

  if (
    typeof order.discount !== "number" ||
    !Number.isFinite(order.discount) ||
    order.discount < 0 ||
    order.discount > MAX_DISCOUNT
  ) {
    throw new Error(
      `Discount must be between 0 and ${MAX_DISCOUNT} percent.`
    );
  }

  if (
    typeof order.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(order.date) ||
    !Number.isFinite(Date.parse(`${order.date}T00:00:00Z`)) ||
    new Date(`${order.date}T00:00:00Z`).toISOString().slice(0, 10) !==
      order.date
  ) {
    throw new Error("Order date must be a valid YYYY-MM-DD date.");
  }

  if (!VALID_ORDER_STATUSES.includes(order.status)) {
    throw new Error(
      `Invalid order status: ${order.status}`
    );
  }

  return true;
}
