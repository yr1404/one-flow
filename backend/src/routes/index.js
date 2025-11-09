const express = require('express');

const router = express.Router();

// Feature routes
router.use('/auth', require('./auth'));
router.use('/projects', require('./projects'));
router.use('/partners', require('./partners'));
router.use('/tasks', require('./tasks'));
router.use('/task-assignees', require('./taskAssignees'));
router.use('/products', require('./products'));
router.use('/purchase-orders', require('./purchaseOrders'));
router.use('/purchase-order-items', require('./purchaseOrderItems'));
router.use('/invoices', require('./invoices'));
router.use('/sales-orders', require('./salesOrders'));
router.use('/vendor-bills', require('./vendorBills'));
router.use('/vendor-bill-items', require('./vendorBillItems'));
router.use('/expenses', require('./expenses'));
router.use('/time-entries', require('./timeEntries'));
router.use('/sales-order-items', require('./salesOrderItems'));
router.use('/invoice-items', require('./invoiceItems'));
router.use('/users', require('./users'));

module.exports = router;
