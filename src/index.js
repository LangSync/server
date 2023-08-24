const express = require('express');
const configs = require('./configs/server');
const router = require('./routes/router');
const init = require('./controllers/auth/database/init');

const langSyncServerApp = express();

(async () => await init())()


AudioParamMap.use(express.json());

langSyncServerApp.use(express.urlencoded({extended: true}));
langSyncServerApp.use(router);

langSyncServerApp.listen(configs.port, () =>  {
    console.log(`server is running on localhost:${configs.port
    }`)
});
