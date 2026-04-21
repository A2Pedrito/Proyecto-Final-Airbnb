import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Páginas — las vas creando una a una
import LoginPage       from './pages/auth/LoginPage';
import RegisterPage    from './pages/auth/RegisterPage';
import ConfirmPage     from './pages/auth/ConfirmPage';
import MyPropertiesPage from './pages/host/MyPropertiesPage';
import PropertyFormPage from './pages/host/PropertyFormPage';
import SearchPage      from './pages/guest/SearchPage';
import MyBookingsPage  from './pages/guest/MyBookingsPage';
import NotificationsPage from './pages/NotificationsPage';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/login"    element={<Layout><LoginPage /></Layout>} />
          <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
          <Route path="/confirm/:token" element={<Layout><ConfirmPage /></Layout>} />

          {/* Solo Host */}
          <Route path="/host/properties" element={
            <ProtectedRoute allowedRoles={['Host']}>
              <Layout><MyPropertiesPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/host/properties/new" element={
            <ProtectedRoute allowedRoles={['Host']}>
              <Layout><PropertyFormPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/host/properties/:id/edit" element={
            <ProtectedRoute allowedRoles={['Host']}>
              <Layout><PropertyFormPage /></Layout>
            </ProtectedRoute>
          } />

          {/* Solo Guest */}
          <Route path="/guest/search" element={
            <ProtectedRoute allowedRoles={['Guest']}>
              <Layout><SearchPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/guest/bookings" element={
            <ProtectedRoute allowedRoles={['Guest']}>
              <Layout><MyBookingsPage /></Layout>
            </ProtectedRoute>
          } />

          {/* Ambos roles */}
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Layout><NotificationsPage /></Layout>
            </ProtectedRoute>
          } />

          {/* Página por defecto → login */}
          <Route path="*" element={<Layout><LoginPage /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}