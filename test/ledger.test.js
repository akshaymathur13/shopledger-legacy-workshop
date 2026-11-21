var assert = require('node:assert/strict');
var test = require('node:test');
var ledger = require('../lib/ledger');

test('recording a string payment against a stored string settlement total', function () {
  var customer = { id: 1, name: 'Meera Joshi', totalBilled: 2432.01, totalSettled: '1200' };
  var db = { customers: [customer], nextSettlementId: 1 };

  assert.equal(ledger.listCustomers(db)[0].balance, 1232.01);
  var result = ledger.recordSettlement(db, 1, '500');

  assert.equal(result.ok, true);
  assert.equal(result.settlement.amount, 500);
  assert.equal(customer.totalSettled, 1700);
  assert.equal(customer.balance, 732.01);
  assert.equal(ledger.listCustomers(db)[0].balance, 732.01);
});

test('a first settlement works with legacy numeric strings and rejects invalid amounts', function () {
  var customer = { id: 1, openingBalance: '10.25', totalBilled: '20.25' };
  var db = { customers: [customer], nextSettlementId: 1 };

  [true, [500], {}, 'not an amount', Infinity, 0, -500].forEach(function (amount) {
    assert.equal(ledger.recordSettlement(db, 1, amount).ok, false);
  });
  assert.equal(db.nextSettlementId, 1);
  assert.equal(customer.totalSettled, undefined);

  assert.equal(ledger.recordSettlement(db, 1, 0.15).ok, true);
  assert.equal(customer.totalSettled, 0.15);
  assert.equal(customer.balance, 30.35);
});
