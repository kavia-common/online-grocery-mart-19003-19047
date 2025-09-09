'use strict';

const express = require('express');
const controller = require('../controllers/discountController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Discounts
 *   description: Discount management operations
 */

/**
 * @swagger
 * /discounts:
 *   get:
 *     summary: List all discounts
 *     tags: [Discounts]
 *     security:
 *       - OAuth2: []
 *     responses:
 *       200:
 *         description: A list of discounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Discount'
 *       500:
 *         description: Internal server error
 */
router.get('/discounts', authenticate(true), controller.list.bind(controller));

/**
 * @swagger
 * /discounts:
 *   post:
 *     summary: Create a new discount
 *     tags: [Discounts]
 *     security:
 *       - OAuth2: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Discount'
 *     responses:
 *       201:
 *         description: Discount created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/discounts', authenticate(true), controller.create.bind(controller));

/**
 * @swagger
 * /discounts/{id}:
 *   get:
 *     summary: Get discount by ID
 *     tags: [Discounts]
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Discount details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Discount'
 *       404:
 *         description: Discount not found
 *       500:
 *         description: Internal server error
 */
router.get('/discounts/:id', authenticate(true), controller.getById.bind(controller));

/**
 * @swagger
 * /discounts/{id}:
 *   put:
 *     summary: Update discount by ID
 *     tags: [Discounts]
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Discount'
 *     responses:
 *       200:
 *         description: Discount updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Discount not found
 *       500:
 *         description: Internal server error
 */
router.put('/discounts/:id', authenticate(true), controller.update.bind(controller));

/**
 * @swagger
 * /discounts/{id}:
 *   delete:
 *     summary: Delete discount by ID
 *     tags: [Discounts]
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Discount deleted
 *       404:
 *         description: Discount not found
 *       500:
 *         description: Internal server error
 */
router.delete('/discounts/:id', authenticate(true), controller.remove.bind(controller));

/**
 * @swagger
 * /apply-discount:
 *   post:
 *     summary: Apply discount to cart
 *     tags: [Discounts]
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: query
 *         name: cartTotal
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *         description: Optional cart total to compute discount amount for percentage/fixed types
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyDiscountRequest'
 *     responses:
 *       200:
 *         description: Discount applied successfully
 *       400:
 *         description: Invalid discount code or cart ID
 *       500:
 *         description: Internal server error
 */
router.post('/apply-discount', authenticate(true), controller.apply.bind(controller));

module.exports = router;
