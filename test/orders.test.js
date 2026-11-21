var assert = require('node:assert/strict');
var test = require('node:test');
var orders = require('../lib/orders');

var db = { orders: [
  { id: 1001, date: '28/12/2021' },
  { id: 1004, date: '30/01/2022' },
  { id: 1008, date: '15/03/2022' }
] };

function ids(filters) {
  return orders.list(db, filters).map(function (order) { return order.id; });
}

test('order history sorts dates across months and years', function () {
  assert.deepEqual(ids(), [1008, 1004, 1001]);
});

test('order history filters across months with inclusive date bounds', function () {
  assert.deepEqual(ids({ from: '2022-01-30', to: '15/03/2022' }), [1008, 1004]);
  assert.deepEqual(ids({ from: '15/03/2022' }), [1008]);
  assert.deepEqual(ids({ to: '2022-01-30' }), [1004, 1001]);
});

test('order history returns no matches for invalid or reversed date ranges', function () {
  assert.deepEqual(ids({ from: 'not-a-date' }), []);
  assert.deepEqual(ids({ from: '2022-02-30' }), []);
  assert.deepEqual(ids({ from: '2022-03-15', to: '2022-01-30' }), []);
});
