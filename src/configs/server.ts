import crypto from 'crypto';


export default {
  port: process.env.PORT || 3000,
  cipherSecretKey: crypto.randomBytes(32),
  serverInitVector: crypto.randomBytes(16),
};
