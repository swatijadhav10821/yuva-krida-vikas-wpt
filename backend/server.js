   const express = require('express');
   const cors = require('cors');
   const config = require('./config');
   const authRoutes = require('./routes/auth');

   const app = express();

   app.use(cors());
   app.use(express.json());
   app.use('/api', authRoutes);

   app.get('/api/test', (req, res) => {
     res.json({ message: 'Server is running' });
   });

   app.listen(config.port, () => {
     console.log('Server started on port ' + config.port);
   });