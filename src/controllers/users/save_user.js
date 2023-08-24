const database = require('../../controllers/database/add_data');
export function saveUser(req, res) {

     const { tokenFromProvider } = req.body;

        if (!tokenFromProvider) { 
            return res.status(400).json({ error: 'Token not found' });
        }  else {
            //  const addUserToDatabase = 

        }
}