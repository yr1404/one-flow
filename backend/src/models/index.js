// models/index.js
const sequelize = require("./db-sequelize");

// import models
const User = require("./user");
const Project = require("./project");
const Task = require("./task");
const TimeEntry = require("./timeEntry");
const Attachment = require("./attachment");
const Comment = require("./comment");
const Expense = require("./expense");
const Team = require("./team");
const TeamMember = require("./teamMember");
const ProjectTeam = require("./projectTeam");
// Partner replaces Vendor & Customer (role enum distinguishes)
const Partner = require("./partner");
const PurchaseOrder = require("./purchaseOrder");
const PurchaseOrderItem = require("./purchaseOrderItem");
// Remove separate Customer model in favor of Partner
const SalesOrder = require("./salesOrder");
const SalesOrderItem = require("./salesOrderItem");
const Product = require("./product");

// Associations

// Users <-> Projects
User.hasMany(Project, { foreignKey: "manager_id", as: "managed_projects" });
Project.belongsTo(User, { foreignKey: "manager_id", as: "manager" });

// Project -> Task
Project.hasMany(Task, { foreignKey: "project_id" });
Task.belongsTo(Project, { foreignKey: "project_id" });

// Task <-> User (assigned and created)
User.hasMany(Task, { foreignKey: "assigned_to", as: "assigned_tasks" });
User.hasMany(Task, { foreignKey: "created_by", as: "created_tasks" });
Task.belongsTo(User, { foreignKey: "assigned_to", as: "assignee" });
Task.belongsTo(User, { foreignKey: "created_by", as: "creator" });

// Task -> TimeEntry, Attachment, Comment
Task.hasMany(TimeEntry, { foreignKey: "task_id" });
TimeEntry.belongsTo(Task, { foreignKey: "task_id" });
Task.hasMany(Attachment, { foreignKey: "task_id" });
Attachment.belongsTo(Task, { foreignKey: "task_id" });
Task.hasMany(Comment, { foreignKey: "task_id" });
Comment.belongsTo(Task, { foreignKey: "task_id" });

// Users -> TimeEntry/Attachment/Comment
User.hasMany(TimeEntry, { foreignKey: "user_id" });
TimeEntry.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Attachment, { foreignKey: "user_id" });
Attachment.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Comment, { foreignKey: "user_id" });
Comment.belongsTo(User, { foreignKey: "user_id" });

// Projects -> Expense
Project.hasMany(Expense, { foreignKey: "project_id" });
Expense.belongsTo(Project, { foreignKey: "project_id" });
User.hasMany(Expense, { foreignKey: "user_id" });
Expense.belongsTo(User, { foreignKey: "user_id" });

// Team relations
Team.hasMany(TeamMember, { foreignKey: "team_id" });
TeamMember.belongsTo(Team, { foreignKey: "team_id" });
User.hasMany(TeamMember, { foreignKey: "user_id" });
TeamMember.belongsTo(User, { foreignKey: "user_id" });

// ProjectTeam (many-to-many Project <-> Team)
Team.belongsToMany(Project, { through: ProjectTeam, foreignKey: "team_id", otherKey: "project_id", as: "projects" });
Project.belongsToMany(Team, { through: ProjectTeam, foreignKey: "project_id", otherKey: "team_id", as: "teams" });

// Partner (role='vendor') & PurchaseOrder
Partner.hasMany(PurchaseOrder, { foreignKey: "vendor_id", as: "purchase_orders" });
PurchaseOrder.belongsTo(Partner, { foreignKey: "vendor_id", as: "vendor" });
Project.hasMany(PurchaseOrder, { foreignKey: "project_id" });
PurchaseOrder.belongsTo(Project, { foreignKey: "project_id" });
User.hasMany(PurchaseOrder, { foreignKey: "created_by" });
PurchaseOrder.belongsTo(User, { foreignKey: "created_by" });

// PurchaseOrderItem <-> PurchaseOrder, Product
PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: "purchase_order_id" });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: "purchase_order_id" });
Product.hasMany(PurchaseOrderItem, { foreignKey: "product_id" });
PurchaseOrderItem.belongsTo(Product, { foreignKey: "product_id" });

// Partner (role='customer') & SalesOrder
Partner.hasMany(SalesOrder, { foreignKey: "customer_id", as: "sales_orders" });
SalesOrder.belongsTo(Partner, { foreignKey: "customer_id", as: "customer" });
User.hasMany(SalesOrder, { foreignKey: "created_by" });
SalesOrder.belongsTo(User, { foreignKey: "created_by" });

// SalesOrderItem <-> SalesOrder, Product
SalesOrder.hasMany(SalesOrderItem, { foreignKey: "sales_order_id" });
SalesOrderItem.belongsTo(SalesOrder, { foreignKey: "sales_order_id" });
Product.hasMany(SalesOrderItem, { foreignKey: "product_id" });
SalesOrderItem.belongsTo(Product, { foreignKey: "product_id" });

// Export
module.exports = {
  sequelize,
  User,
  Project,
  Task,
  TimeEntry,
  Attachment,
  Comment,
  Expense,
  Team,
  TeamMember,
  ProjectTeam,
  Partner,
  PurchaseOrder,
  PurchaseOrderItem,
  SalesOrder,
  SalesOrderItem,
  Product,
};
