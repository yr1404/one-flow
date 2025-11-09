// models/index.js
const sequelize = require('./db-sequelize');

// Core / domain models
const User = require('./user');
const Project = require('./project');
const Task = require('./task');
const TaskAssignee = require('./taskAssignee');
const TimeEntry = require('./timeEntry');
const Expense = require('./expense');
const Partner = require('./partner');
const Product = require('./product');
const PurchaseOrder = require('./purchaseOrder');
const PurchaseOrderItem = require('./purchaseOrderItem');
const SalesOrder = require('./salesOrder');
const SalesOrderItem = require('./salesOrderItem');
const Invoice = require('./invoice');
const InvoiceItem = require('./invoiceItem');
const VendorBill = require('./vendorBill');
const VendorBillItem = require('./vendorBillItem');

// ================= Associations =================

// Users <-> Projects
User.hasMany(Project, { foreignKey: 'manager_id', as: 'managed_projects', onDelete: 'SET NULL' });
Project.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });

// Project -> Tasks
Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Task creator & assignees
User.hasMany(Task, { foreignKey: 'created_by', as: 'created_tasks', onDelete: 'SET NULL' });
Task.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
// Many-to-many assignment via TaskAssignee join table
Task.hasMany(TaskAssignee, { foreignKey: 'task_id', as: 'assignee_links', onDelete: 'CASCADE' });
TaskAssignee.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
User.hasMany(TaskAssignee, { foreignKey: 'user_id', as: 'assigned_links', onDelete: 'CASCADE' });
TaskAssignee.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Task.belongsToMany(User, { through: TaskAssignee, foreignKey: 'task_id', otherKey: 'user_id', as: 'assignees' });
User.belongsToMany(Task, { through: TaskAssignee, foreignKey: 'user_id', otherKey: 'task_id', as: 'assigned_tasks' });

// Tasks -> TimeEntries
Task.hasMany(TimeEntry, { foreignKey: 'task_id', as: 'time_entries', onDelete: 'CASCADE', constraints: true });
TimeEntry.belongsTo(Task, { foreignKey: 'task_id', as: 'task', constraints: true });

// Users -> TimeEntries
User.hasMany(TimeEntry, { foreignKey: 'user_id', as: 'time_entries', onDelete: 'CASCADE', constraints: true });
TimeEntry.belongsTo(User, { foreignKey: 'user_id', as: 'user', constraints: true });

// Project / User -> Expenses
Project.hasMany(Expense, { foreignKey: 'project_id', as: 'expenses', onDelete: 'CASCADE' });
Expense.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
User.hasMany(Expense, { foreignKey: 'user_id', as: 'expenses', onDelete: 'SET NULL' });
Expense.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Product -> all item tables
Product.hasMany(PurchaseOrderItem, { foreignKey: 'product_id', as: 'purchase_order_items' });
PurchaseOrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(SalesOrderItem, { foreignKey: 'product_id', as: 'sales_order_items' });
SalesOrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(InvoiceItem, { foreignKey: 'product_id', as: 'invoice_items' });
InvoiceItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(VendorBillItem, { foreignKey: 'product_id', as: 'vendor_bill_items' });
VendorBillItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Purchase Orders
Partner.hasMany(PurchaseOrder, { foreignKey: 'vendor_id', as: 'purchase_orders', onDelete: 'RESTRICT' });
PurchaseOrder.belongsTo(Partner, { foreignKey: 'vendor_id', as: 'vendor' });
Project.hasMany(PurchaseOrder, { foreignKey: 'project_id', as: 'purchase_orders', onDelete: 'SET NULL' });
PurchaseOrder.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
User.hasMany(PurchaseOrder, { foreignKey: 'created_by', as: 'created_purchase_orders', onDelete: 'SET NULL' });
PurchaseOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchase_order_id', as: 'items', onDelete: 'CASCADE' });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchase_order' });

// Sales Orders (updated schema)
Partner.hasMany(SalesOrder, { foreignKey: 'partnerId', as: 'sales_orders', onDelete: 'RESTRICT' });
SalesOrder.belongsTo(Partner, { foreignKey: 'partnerId', as: 'partner' });
Project.hasMany(SalesOrder, { foreignKey: 'projectId', as: 'sales_orders', onDelete: 'SET NULL' });
SalesOrder.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
User.hasMany(SalesOrder, { foreignKey: 'createdBy', as: 'created_sales_orders', onDelete: 'SET NULL' });
SalesOrder.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
SalesOrder.hasMany(SalesOrderItem, { foreignKey: 'sales_order_id', as: 'items', onDelete: 'CASCADE' });
SalesOrderItem.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'sales_order' });

// Invoices
SalesOrder.hasOne(Invoice, { foreignKey: 'sales_order_id', as: 'invoice', onDelete: 'CASCADE' });
Invoice.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'sales_order' });
User.hasMany(Invoice, { foreignKey: 'created_by', as: 'created_invoices', onDelete: 'SET NULL' });
Invoice.belongsTo(User, { foreignKey: 'created_by', as: 'invoice_creator' });
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoice_id', as: 'items', onDelete: 'CASCADE' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });

// Vendor Bills
Partner.hasMany(VendorBill, { foreignKey: 'vendor_id', as: 'vendor_bills', onDelete: 'RESTRICT' });
VendorBill.belongsTo(Partner, { foreignKey: 'vendor_id', as: 'vendor' });
PurchaseOrder.hasMany(VendorBill, { foreignKey: 'purchase_order_id', as: 'vendor_bills', onDelete: 'SET NULL' });
VendorBill.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchase_order' });
VendorBill.hasMany(VendorBillItem, { foreignKey: 'vendor_bill_id', as: 'items', onDelete: 'CASCADE' });
VendorBillItem.belongsTo(VendorBill, { foreignKey: 'vendor_bill_id', as: 'vendor_bill' });

// ================= Export =================
module.exports = {
  sequelize,
  User,
  Project,
  Task,
  TaskAssignee,
  TimeEntry,
  Expense,
  Partner,
  Product,
  PurchaseOrder,
  PurchaseOrderItem,
  SalesOrder,
  SalesOrderItem,
  Invoice,
  InvoiceItem,
  VendorBill,
  VendorBillItem,
};
