import { Routes, Route, Outlet } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Tournaments from './pages/Tournaments';
import TournamentDetails from './pages/TournamentDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import AthleteDashboard from './pages/athlete/AthleteDashboard';
import BookFacility from './pages/athlete/BookFacility';
import Training from './pages/athlete/Training';
import CoachDashboard from './pages/coach/CoachDashboard';
import Attendance from './pages/coach/Attendance';
import EnterScores from './pages/coach/EnterScores';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFacilities from './pages/admin/AdminFacilities';
import AdminTournaments from './pages/admin/AdminTournaments';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournaments/:id" element={<TournamentDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/athlete" element={<ProtectedRoute roles={['athlete']}><Outlet /></ProtectedRoute>}>
          <Route index element={<AthleteDashboard />} />
          <Route path="book" element={<BookFacility />} />
          <Route path="training" element={<Training />} />
        </Route>

        <Route path="/coach" element={<ProtectedRoute roles={['coach']}><Outlet /></ProtectedRoute>}>
          <Route index element={<CoachDashboard />} />
          <Route path="trainings/:id" element={<Attendance />} />
          <Route path="scores" element={<EnterScores />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Outlet /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="facilities" element={<AdminFacilities />} />
          <Route path="tournaments" element={<AdminTournaments />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;