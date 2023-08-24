const configs = require('../../configs/server');

export function verifyApiKeyWithUserAuthToken(req, res) {
    const secretKey = configs.cipherSecretKey;
    
    const encryptedToken = '...';
    const userAuthToken = '...';

    const decipher = crypto.createDecipher('aes-256-ctr', secretKey);

    let decryptedAuthToken = decipher.update(encryptedToken, 'hex', 'utf8'); 
    decryptedAuthToken += decipher.final('utf8');
 
    console.log('Decrypted Auth Token:', decryptedAuthToken);

if (decryptedAuthToken === userAuthToken) {
  res.status(200).json({
    is_valid: true,
    message: 'API Key is valid'  
});

} else {
    res.status(401).json({
        is_valid: false,
        message: 'API Key is invalid'
    });
}
}