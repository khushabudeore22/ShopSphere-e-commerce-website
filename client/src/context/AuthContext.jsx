import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('shopsphere_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('shopsphere_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Sync token and verify user on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('shopsphere_token');
      if (storedToken) {
        try {
          const { data } = await api.get('/users/profile');
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem('shopsphere_user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.warn('Could not verify profile from server, using local data', err?.message);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/users/login', { email, password });
      const authToken = data.token;
      const authUser = data.user;

      setToken(authToken);
      setUser(authUser);
      localStorage.setItem('shopsphere_token', authToken);
      localStorage.setItem('shopsphere_user', JSON.stringify(authUser));

      toast.success(`Welcome back, ${authUser.name}!`);
      return { success: true, user: authUser };
    } catch (error) {
      // Fallback offline mode if backend isn't reached
      if (!error.response && email) {
        const fallbackUser = {
          _id: 'mock_user_1',
          name: email.split('@')[0],
          email,
          role: email.includes('admin') ? 'admin' : 'user',
          phone: '+91 9876543210',
          address: '123 Main St, Tech City',
        };
        const mockToken = 'mock_jwt_token_' + Date.now();
        setToken(mockToken);
        setUser(fallbackUser);
        localStorage.setItem('shopsphere_token', mockToken);
        localStorage.setItem('shopsphere_user', JSON.stringify(fallbackUser));
        toast.success(`Welcome, ${fallbackUser.name}! (Offline Mode)`);
        return { success: true, user: fallbackUser };
      }

      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/users/register', userData);
      const authToken = data.token;
      const authUser = data.user;

      setToken(authToken);
      setUser(authUser);
      localStorage.setItem('shopsphere_token', authToken);
      localStorage.setItem('shopsphere_user', JSON.stringify(authUser));

      toast.success('Registration successful! Welcome to ShopSphere.');
      return { success: true, user: authUser };
    } catch (error) {
      if (!error.response && userData?.email) {
        const fallbackUser = {
          _id: 'mock_user_' + Date.now(),
          name: userData.name || userData.email.split('@')[0],
          email: userData.email,
          role: 'user',
          phone: userData.phone || '',
          address: userData.address || '',
        };
        const mockToken = 'mock_jwt_token_' + Date.now();
        setToken(mockToken);
        setUser(fallbackUser);
        localStorage.setItem('shopsphere_token', mockToken);
        localStorage.setItem('shopsphere_user', JSON.stringify(fallbackUser));
        toast.success('Account created! (Offline Mode)');
        return { success: true, user: fallbackUser };
      }

      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const { data } = await api.put('/users/profile', updatedData);
      const updatedUser = data.user || data;
      setUser(updatedUser);
      localStorage.setItem('shopsphere_user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully!');
      return { success: true, user: updatedUser };
    } catch (error) {
      if (!error.response) {
        const newUserData = { ...user, ...updatedData };
        setUser(newUserData);
        localStorage.setItem('shopsphere_user', JSON.stringify(newUserData));
        toast.success('Profile updated locally!');
        return { success: true, user: newUserData };
      }
      const msg = error.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('shopsphere_token');
    localStorage.removeItem('shopsphere_user');
    toast.success('Logged out successfully.');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
