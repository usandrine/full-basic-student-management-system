"use client";

import React, { useState } from 'react';

interface FormDataState {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  courseOfStudy: string;
  enrollmentYear: string; // as string from input
  role: 'student' | 'admin' | '';
}

interface DataToSend {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  courseOfStudy: string;
  enrollmentYear: string | number;
  role: 'student' | 'admin' | '';
}

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (formData: DataToSend) => void;
  loading: boolean;
  error: string | null;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit, loading, error }) => {
  const [formData, setFormData] = useState<FormDataState>({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    courseOfStudy: '',
    enrollmentYear: '',
    role: type === 'register' ? 'student' : '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSend: DataToSend = { ...formData };

    if (type === 'register' && dataToSend.enrollmentYear !== '') {
      dataToSend.enrollmentYear = Number(dataToSend.enrollmentYear);
    }

    onSubmit(dataToSend);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {type === 'login' ? 'Login' : 'Register'}
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'register' && (
            <>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                <input
                  type="text"
                  name="phoneNumber"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formData.role === 'student' && (
                <>
                  <div>
                    <label htmlFor="courseOfStudy" className="block text-sm font-medium text-gray-700">Course of Study</label>
                    <input
                      type="text"
                      name="courseOfStudy"
                      id="courseOfStudy"
                      value={formData.courseOfStudy}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="enrollmentYear" className="block text-sm font-medium text-gray-700">Enrollment Year</label>
                    <input
                      type="number"
                      name="enrollmentYear"
                      id="enrollmentYear"
                      value={formData.enrollmentYear}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </>
              )}
            </>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (type === 'login' ? 'Login' : 'Register')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
