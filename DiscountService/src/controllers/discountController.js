'use strict';

const service = require('../services/discountService');
const { discountSchema, discountUpdateSchema, applyDiscountSchema } = require('../validation/schemas');

class DiscountController {
  // PUBLIC_INTERFACE
  async list(req, res) {
    /** List all discounts */
    const items = await service.listDiscounts();
    return res.status(200).json(items);
  }

  // PUBLIC_INTERFACE
  async getById(req, res) {
    /** Get discount by ID */
    const { id } = req.params;
    const d = await service.getDiscount(id);
    if (!d) return res.status(404).json({ code: 404, message: 'Discount not found' });
    return res.status(200).json(d);
  }

  // PUBLIC_INTERFACE
  async create(req, res) {
    /** Create a new discount */
    const { error, value } = discountSchema.validate(req.body, { abortEarly: false, convert: true });
    if (error) {
      return res.status(400).json({ code: 400, message: error.details.map(d => d.message).join(', ') });
    }
    try {
      const created = await service.createDiscount({
        code: value.code,
        type: value.type,
        value: value.value,
        description: value.description || null,
        validFrom: value.validFrom,
        validTo: value.validTo,
        isActive: value.isActive !== undefined ? value.isActive : true,
      });
      return res.status(201).json(created);
    } catch (err) {
      return res.status(err.status || 500).json({ code: err.status || 500, message: err.message || 'Internal server error' });
    }
  }

  // PUBLIC_INTERFACE
  async update(req, res) {
    /** Update discount by ID */
    const { id } = req.params;
    const { error, value } = discountUpdateSchema.validate(req.body, { abortEarly: false, convert: true });
    if (error) {
      return res.status(400).json({ code: 400, message: error.details.map(d => d.message).join(', ') });
    }
    try {
      const updated = await service.updateDiscount(id, {
        code: value.code,
        type: value.type,
        value: value.value,
        description: value.description || null,
        validFrom: value.validFrom,
        validTo: value.validTo,
        isActive: value.isActive,
      });
      if (!updated) return res.status(404).json({ code: 404, message: 'Discount not found' });
      return res.status(200).json(updated);
    } catch (err) {
      return res.status(err.status || 500).json({ code: err.status || 500, message: err.message || 'Internal server error' });
    }
  }

  // PUBLIC_INTERFACE
  async remove(req, res) {
    /** Delete discount by ID */
    const { id } = req.params;
    const ok = await service.deleteDiscount(id);
    if (!ok) return res.status(404).json({ code: 404, message: 'Discount not found' });
    return res.status(204).send();
  }

  // PUBLIC_INTERFACE
  async apply(req, res) {
    /** Apply discount to cart */
    const { error, value } = applyDiscountSchema.validate(req.body, { abortEarly: false, convert: true });
    if (error) {
      return res.status(400).json({ code: 400, message: error.details.map(d => d.message).join(', ') });
    }
    try {
      // Optionally accept cartTotal query param for simple calculation
      const cartTotal = req.query.cartTotal ? Number(req.query.cartTotal) : 0;
      const result = await service.applyDiscount({ cartId: value.cartId, discountCode: value.discountCode, cartTotal });
      return res.status(200).json(result);
    } catch (err) {
      return res.status(err.status || 500).json({ code: err.status || 500, message: err.message || 'Internal server error' });
    }
  }
}

module.exports = new DiscountController();
