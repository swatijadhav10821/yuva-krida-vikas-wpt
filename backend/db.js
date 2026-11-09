   const mysql = require('mysql2');
   const config = require('./config');

      const pool = mysql.createPool({ ...config.db, dateStrings: true });

   module.exports = pool.promise();