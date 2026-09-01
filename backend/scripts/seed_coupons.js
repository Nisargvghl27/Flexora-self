const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const coupons = [
  {
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 0,
    max_uses: null
  },
  {
    code: 'FLEX50',
    discount_type: 'flat',
    discount_value: 50,
    min_order_amount: 0,
    max_uses: null
  },
  {
    code: 'STYLE20',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 2000,
    max_uses: null
  }
];

const seedCoupons = () => {
  console.log('Seeding coupons...');
  
  const insert = db.prepare(`
    INSERT OR IGNORE INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_uses)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction((couponsToInsert) => {
    for (const coupon of couponsToInsert) {
      insert.run(
        uuidv4(),
        coupon.code,
        coupon.discount_type,
        coupon.discount_value,
        coupon.min_order_amount,
        coupon.max_uses
      );
    }
  });

  tx(coupons);
  console.log('Coupons seeded successfully.');
};

if (require.main === module) {
  seedCoupons();
}

module.exports = seedCoupons;
