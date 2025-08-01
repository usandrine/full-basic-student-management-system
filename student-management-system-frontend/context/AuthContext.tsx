// frontend/context/AuthContext.tsx
"use client";
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '../utils/api'; // Our axios instance

// Define the shape of a user object (adjust as per your backend response)
interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'student' | 'admin';
  phoneNumber?: string;
  profilePicture?: string;
  courseOfStudy?: string;
  enrollmentYear?: number; // Keep as number for consistency with backend
  status?: "Active" | "Graduated" | "Dropped" | "Suspended"; // Use specific literal types
}

// Define the shape of our AuthContext state and functions
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, '_id'> & { password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  updateUser: (updatedUserData: Partial<User>) => void; // <-- ADDED: Function to update user data
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function to clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // NEW: Function to update the user state in context and localStorage
  const updateUser = useCallback((updatedUserData: Partial<User>) => {
    setUser(prevUser => {
      const newUser = prevUser ? { ...prevUser, ...updatedUserData } : null;
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
      }
      return newUser;
    });
  }, []);

  // Load user and token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        // Set api default header for authorization if you're using Axios for subsequent requests
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (e) {
        console.error("Failed to parse stored user or token", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false); // Finished loading initial state
  }, []); // Empty dependency array means this runs once on mount

  // Functions for authentication
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, ...userData } = res.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(receivedToken);
      setUser(userData as User); // Cast to User type to ensure consistency
      api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`; // Set header for Axios
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage); // Re-throw to handle in component
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Omit<User, '_id'> & { password: string }) => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const res = await api.post('/auth/register', userData);
      const { token: receivedToken, ...newUser } = res.data; // Assuming your backend returns token and user after registration

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(receivedToken);
      setUser(newUser as User); // Cast to User type
      api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`; // Set header for Axios
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage); // Re-throw to handle in component
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization']; // Remove auth header on logout
    router.push('/'); // Redirect to landing page
  };

  // Value provided by the context
  const value = { user, token, login, register, logout, loading, error, clearError, updateUser }; // <-- ADDED updateUser

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};