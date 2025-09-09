'use strict';

const Joi = require('joi');

/**
// PUBLIC_INTERFACE
 */
const discountSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  code: Joi.string().max(100).required(),
  type: Joi.string().valid('percentage', 'fixed', 'bogo').required(),
  value: Joi.number().min(0).required(),
  description: Joi.string().allow('', null),
  validFrom: Joi.date().iso().required(),
  validTo: Joi.date().iso().required(),
  isActive: Joi.boolean().optional(),
});

/**
// PUBLIC_INTERFACE
 */
const discountUpdateSchema = Joi.object({
  code: Joi.string().max(100).required(),
  type: Joi.string().valid('percentage', 'fixed', 'bogo').required(),
  value: Joi.number().min(0).required(),
  description: Joi.string().allow('', null),
  validFrom: Joi.date().iso().required(),
  validTo: Joi.date().iso().required(),
  isActive: Joi.boolean().optional(),
});

/**
// PUBLIC_INTERFACE
 */
const applyDiscountSchema = Joi.object({
  cartId: Joi.string().required(),
  discountCode: Joi.string().required(),
});

module.exports = {
  // PUBLIC_INTERFACE
  discountSchema,
  // PUBLIC_INTERFACE
  discountUpdateSchema,
  // PUBLIC_INTERFACE
  applyDiscountSchema,
};
