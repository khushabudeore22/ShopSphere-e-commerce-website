import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading message="Authenticating..." />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
