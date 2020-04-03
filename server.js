    const port = process.env.port;
    const express = require('express');
    const bodyParser = require('body-parser');

    const app = express();

    global.url = process.env.apiUrl

    getData();

    app.use(express.static('public'))

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.all("/*", function(req, res, next){ 
        res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Accept-Encoding');
        next();
      });
 
    const route = require('./router/routes');
    app.use(route);
    app.listen(port);

    async function getData() {
      var result;
      global.mysql = require('./connection');
      result = await mysql.execute('SELECT * FROM tbl_country_basic_information');
      global.countryData = result[0];
      result = await mysql.execute('SELECT * FROM tbl_user');
      global.userData = result[0];
      result = await mysql.execute('SELECT * FROM tbl_unsdg_database');
      global.unsdgData = result[0];
      result = await mysql.execute('SELECT * FROM tbl_stakeholder_scoring');
      global.scoringData = result[0];
      result = await mysql.execute('SELECT * FROM tbl_business_commission');
      global.commissionData = result[0];
      result = await mysql.execute('SELECT * FROM tbl_instrument_types');
      global.instrumentsData = result[0];
  }