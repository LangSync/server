 const crypto = require('crypto');

module.exports = {
    port: process.env.PORT || 3000,
    cipherSecretKey: crypto.randomBytes(32),

 }