import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import RequireAuth from './components/RequireAuth';
import Navbar from './components/Navbar';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import EventForm from './pages/EventForm';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SharedEvent from './pages/SharedEvent';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <div style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--bg)' }}>
            <Routes>
              {/* Entry point: send everyone to login first, per the required workflow */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Everything below requires authentication. If someone isn't logged
                  in yet, RequireAuth sends them to /login and remembers where
                  they were headed so a share link survives the login step. */}
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/events" element={<RequireAuth><EventList /></RequireAuth>} />
              <Route path="/events/:id" element={<RequireAuth><EventDetail /></RequireAuth>} />
              <Route path="/create-event" element={<RequireAuth><EventForm /></RequireAuth>} />
              <Route path="/edit-event/:id" element={<RequireAuth><EventForm /></RequireAuth>} />
              <Route path="/shared/:token" element={<RequireAuth><SharedEvent /></RequireAuth>} />

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
