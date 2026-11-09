# Youth Sports Talent Development and Facility Management Platform

Web name: Yuva Krida Vikas

A web application where young athletes find training, book sports facilities and register for tournaments. Coaches manage training and match scores. Admins manage users, facilities, tournaments and visitor messages.

## Technology

- Frontend: React (Vite), Tailwind CSS, React Router, Axios
- Backend: Node.js, Express
- Database: MySQL
- Login: JWT and bcrypt

## Roles

- Visitor: Home, About, Contact, Tournaments, Register, Login
- Athlete: dashboard, book a facility, training, tournament registration
- Coach: dashboard, attendance, enter match scores
- Admin: users, messages, facilities, tournaments

## Setup

1. Clone the repository and open the folder.
2. Database: create the database `yuva_krida_vikas`, then run `database/schema.sql` and `database/sample_data.sql` in MySQL.
3. Backend:
   - `cd backend`
   - copy `config.example.js` to `config.js` and fill in your MySQL password and a JWT secret
   - `npm install`
   - `node server.js`
4. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
5. Open `http://localhost:5173`

## Test logins

Password for all: test123

- admin@ykv.com (admin)
- coach@ykv.com (coach)
- athlete@ykv.com (athlete)

## Team

- Krishna
- Narayan
- Swati