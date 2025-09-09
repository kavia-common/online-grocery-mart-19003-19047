'use strict';

const model = require('../models/discountModel');

/**
 * Validate if a discount is currently valid and active.
 */
function isDiscountValid(discount, at = new Date()) {
  if (!discount) return false;
  if (discount.isActive === false) return false;
  const start = new Date(discount.validFrom);
  const end = new Date(discount.validTo);
  return at >= start && at <= end;
}

/**
 * Compute the discount amount given a cart total.
 * For BOGO type, we assume the calculation is external; here we return 0 as placeholder.
 */
function computeDiscountAmount(discount, cartTotal) {
  if (!isDiscountValid(discount)) return 0;
  if (discount.type === 'percentage') {
    return Math.max(0, (discount.value / 100.0) * cartTotal);
  }
  if (discount.type === 'fixed') {
    return Math.min(cartTotal, Math.max(0, discount.value));
  }
  // 'bogo' requires item-level context; default to 0 here.
  return 0;
}

// PUBLIC_INTERFACE
async function listDiscounts() {
  /** Returns all discounts sorted by creation date. */
  return model.listAll();
}

// PUBLIC_INTERFACE
async function getDiscount(id) {
  /** Returns discount by id or null if not found. */
  return model.getById(id);
}

// PUBLIC_INTERFACE
async function createDiscount(dto) {
  /** Creates a discount with validation on dates and returns the created entity. */
  const from = new Date(dto.validFrom);
  const to = new Date(dto.validTo);
  if (isNaN(from.getTime()) || isNaN(to.getTime()) || from >= to) {
    const err = new Error('validFrom must be before validTo');
    err.status = 400;
    throw err;
  }
  return model.create(dto);
}

// PUBLIC_INTERFACE
async function updateDiscount(id, dto) {
  /** Updates a discount. Returns updated entity or null if not found. */
  const from = new Date(dto.validFrom);
  const to = new Date(dto.validTo);
  if (isNaN(from.getTime()) || isNaN(to.getTime()) || from >= to) {
    const err = new Error('validFrom must be before validTo');
    err.status = 400;
    throw err;
  }
  return model.update(id, dto);
}

// PUBLIC_INTERFACE
async function deleteDiscount(id) {
  /** Deletes a discount by id. Returns true if deleted, false if not found. */
  return model.remove(id);
}

// PUBLIC_INTERFACE
async function applyDiscount({ cartId, discountCode, cartTotal = 0 }) {
  /** Applies a discount to a cart given a known cart total (if provided). Records application. */
  const discount = await model.getByCode(discountCode);
  if (!discount) {
    const err = new Error('Discount not found');
    err.status = 400;
    throw err;
  }
  if (!isDiscountValid(discount)) {
    const err = new Error('Discount not valid or not active');
    err.status = 400;
    throw err;
  }
  const amount = computeDiscountAmount(discount, Number(cartTotal) || 0);
  await model.recordApplication({ discountId: discount.id, cartId, appliedAmount: amount });
  return {
    cartId,
    discountCode,
    discountApplied: amount,
    type: discount.type,
    value: discount.value,
    message:
      discount.type === 'bogo'
        ? 'BOGO discount recorded. Final total should be computed by cart service based on items.'
        : 'Discount applied successfully',
  };
}

module.exports = {
  isDiscountValid,
  computeDiscountAmount,
  listDiscounts,
  getDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  applyDiscount,
};
