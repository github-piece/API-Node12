    const port = process.env.port;
    const express = require('express');
    const bodyParser = require('body-parser');

    const app = express();

    require('./data')()

    app.use(express.static('public')) 

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.all("/*", function(req, res, next){ 
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Accept-Encoding');
        next();
      });
 
    const route = require('./router/routes');
    app.use(route);
    app.listen(port);
