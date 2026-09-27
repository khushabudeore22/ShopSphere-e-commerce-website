import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading message="Checking permissions..." />;
  }

  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
}
