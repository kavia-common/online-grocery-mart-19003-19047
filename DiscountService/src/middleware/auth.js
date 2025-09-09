'use strict';

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const requiredScopes = (process.env.OAUTH2_REQUIRED_SCOPES || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

let client;
if (process.env.OAUTH2_JWKS_URI) {
  client = jwksClient({
    jwksUri: process.env.OAUTH2_JWKS_URI,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 10 * 60 * 1000,
  });
}

/**
 * Extract bearer token from Authorization header.
 */
function getTokenFromHeader(req) {
  const h = req.headers['authorization'] || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

async function getKey(header, callback) {
  if (!client) {
    // fallback to shared secret
    return callback(null, process.env.OAUTH2_JWT_SECRET || 'insecure-default');
  }
  try {
    const key = await client.getSigningKey(header.kid);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  } catch (err) {
    callback(err);
  }
}

/**
// PUBLIC_INTERFACE
 */
function authenticate(required = true) {
  /** OAuth2 authorizationCode flow token validation middleware. Validates JWT against JWKS (if configured) or shared secret, checks issuer/audience and optional scopes. */
  return (req, res, next) => {
    const token = getTokenFromHeader(req);
    if (!token) {
      if (!required) return next();
      return res.status(401).json({ code: 401, message: 'Missing bearer token' });
    }

    const verifyOptions = {
      audience: process.env.OAUTH2_AUDIENCE || undefined,
      issuer: process.env.OAUTH2_ISSUER || undefined,
      algorithms: ['RS256', 'HS256'],
    };

    jwt.verify(token, getKey, verifyOptions, (err, decoded) => {
      if (err) {
        return res.status(401).json({ code: 401, message: 'Invalid token' });
      }
      // scope check
      if (requiredScopes.length > 0) {
        const scopes = (decoded.scope || decoded.scopes || '')
          .toString()
          .split(' ')
          .concat(Array.isArray(decoded.scopes) ? decoded.scopes : []);
        const uniqueScopes = new Set(scopes.filter(Boolean));
        for (const s of requiredScopes) {
          if (!uniqueScopes.has(s)) {
            return res.status(403).json({ code: 403, message: `Missing required scope: ${s}` });
          }
        }
      }
      req.user = decoded;
      next();
    });
  };
}

module.exports = {
  authenticate,
};
