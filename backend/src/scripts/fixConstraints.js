require('dotenv').config();
const { sequelize } = require('../models');

async function run() {
  const client = await sequelize.connectionManager.getConnection();
  try {
    console.log('Fixing FK constraints for purchase_orders...');

    // Try snake_case first
    const queriesSnake = [
      `ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_vendor_id_fkey;`,
      `ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES partners(id) ON DELETE RESTRICT ON UPDATE CASCADE;`,
      `ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_project_id_fkey;`,
      `ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL ON UPDATE CASCADE;`
    ];

    for (const q of queriesSnake) {
      try { await sequelize.query(q); } catch (e) { /* swallow; try camel */ }
    }

    // CamelCase quoted fallback
    const queriesCamel = [
      `ALTER TABLE "PurchaseOrders" DROP CONSTRAINT IF EXISTS "PurchaseOrders_vendor_id_fkey";`,
      `ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "Partners"(id) ON DELETE RESTRICT ON UPDATE CASCADE;`,
      `ALTER TABLE "PurchaseOrders" DROP CONSTRAINT IF EXISTS "PurchaseOrders_project_id_fkey";`,
      `ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Projects"(id) ON DELETE SET NULL ON UPDATE CASCADE;`
    ];

    for (const q of queriesCamel) {
      try { await sequelize.query(q); } catch (e) { /* final */ }
    }

    console.log('FK constraint fix attempted. Please retry your request.');
  } catch (err) {
    console.error('Failed to fix constraints:', err);
    process.exit(1);
  } finally {
    await sequelize.connectionManager.releaseConnection(client);
  }
}

run();
