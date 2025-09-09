'use strict';

const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /docs-usage:
 *   get:
 *     summary: API usage notes
 *     description: >
 *       This API uses OAuth2 (authorization code flow). Obtain a token from your identity provider and include it in the Authorization header as "Bearer <token>".
 *       No WebSocket endpoints are available in this service.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Usage notes
 */
router.get('/docs-usage', (req, res) => {
  res.json({
    message:
      'Use OAuth2 bearer tokens (authorization code flow). No WebSocket endpoints available for this service.',
  });
});

module.exports = router;
