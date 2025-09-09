const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Discount Service API',
      version: '1.0.0',
      description: 'API for managing and applying discounts in the online grocery mart platform.',
    },
    components: {
      securitySchemes: {
        OAuth2: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: process.env.OAUTH2_AUTHORIZATION_URL || 'https://auth.onlinegrocerystore.com/oauth/authorize',
              tokenUrl: process.env.OAUTH2_TOKEN_URL || 'https://auth.onlinegrocerystore.com/oauth/token',
              scopes: {},
            },
          },
        },
      },
      schemas: {
        Discount: {
          type: 'object',
          required: ['code', 'type', 'value', 'validFrom', 'validTo'],
          properties: {
            id: { type: 'string', description: 'Unique identifier for the discount' },
            code: { type: 'string', description: 'Human friendly discount code' },
            type: { type: 'string', enum: ['percentage', 'fixed', 'bogo'], description: 'Type of discount' },
            value: { type: 'number', description: 'Value of the discount' },
            description: { type: 'string', description: 'Description of the discount' },
            validFrom: { type: 'string', format: 'date-time', description: 'Start date of discount validity' },
            validTo: { type: 'string', format: 'date-time', description: 'End date of discount validity' },
            isActive: { type: 'boolean', description: 'Whether the discount is active' },
          },
        },
        ApplyDiscountRequest: {
          type: 'object',
          required: ['cartId', 'discountCode'],
          properties: {
            cartId: { type: 'string', description: 'Identifier of the shopping cart' },
            discountCode: { type: 'string', description: 'Code of the discount to apply' },
          },
        },
        ErrorResponse: {
          type: 'object',
          required: ['code', 'message'],
          properties: {
            code: { type: 'integer', description: 'Error code' },
            message: { type: 'string', description: 'Error message' },
          },
        },
      },
    },
    security: [{ OAuth2: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
