import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Gallery } from './pages/Gallery';
import { ProfileDetail } from './pages/ProfileDetail';
import { Process } from './pages/Process';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { Legal } from './pages/Legal';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminGirls } from './pages/admin/AdminGirls';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminMessages } from './pages/admin/AdminMessages';
import { useAuthStore } from './store/authStore';
import { useProfileStore } from './store/profileStore';

function App() {
  const fetchProfiles = useProfileStore((state) => state.fetchProfiles);

  useEffect(() => {
    // Initial Data Load
    // fetchUsers() removed from here to prevent exposing user data on public pages
    fetchProfiles();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Main Public/Boss Site */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="profile/:id" element={<ProfileDetail />} />
          <Route path="process" element={<Process />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />
          <Route path="legal" element={<Legal />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
           <Route path="dashboard" element={<AdminDashboard />} />
           <Route path="girls" element={<AdminGirls />} />
           <Route path="users" element={<AdminUsers />} />
           <Route path="messages" element={<AdminMessages />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
