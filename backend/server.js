   const express = require('express');
   const config = require('./config');
   const authRoutes = require('./routes/auth');
   const userRoutes = require('./routes/users');
   const messageRoutes = require('./routes/messages');
   const facilityRoutes = require('./routes/facilities');
   const bookingRoutes = require('./routes/bookings');
   const trainingRoutes = require('./routes/trainings');
   const enrollmentRoutes = require('./routes/enrollments');
   const tournamentRoutes = require('./routes/tournaments');
   const registrationRoutes = require('./routes/registrations');
   const matchRoutes = require('./routes/matches');

   const app = express();

   app.use((req, res, next) => {
     res.header('Access-Control-Allow-Origin', '*');
     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
     if (req.method === 'OPTIONS') {
       return res.sendStatus(204);
     }
     next();
   });
   app.use(express.json());

   app.use('/api', authRoutes);
   app.use('/api/users', userRoutes);
   app.use('/api/messages', messageRoutes);
   app.use('/api/facilities', facilityRoutes);
   app.use('/api/bookings', bookingRoutes);
   app.use('/api/trainings', trainingRoutes);
   app.use('/api/enrollments', enrollmentRoutes);
   app.use('/api/tournaments', tournamentRoutes);
   app.use('/api/registrations', registrationRoutes);
   app.use('/api/matches', matchRoutes);

   app.get('/api/test', (req, res) => {
     res.json({ message: 'Server is running' });
   });

   app.listen(config.port, () => {
     console.log('Server started on port ' + config.port);
   });