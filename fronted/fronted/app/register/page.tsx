// frontend/app/register/page.tsx
"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons" // Correct import path

import { useAuth } from '../../context/AuthContext'; // Adjust path if needed

// Define the type for registration data, matching your backend's expected payload
interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string; // Optional
  role: 'student' | 'admin'; // Specific literal types
  courseOfStudy?: string; // Optional, for students
  enrollmentYear?: number; // Optional, for students, and should be a number
}

export default function RegisterPage() {
  const { register, user, loading: authLoading, error: authError, clearError } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null); // For local form validation errors

  const [formData, setFormData] = useState<Omit<RegisterData, 'enrollmentYear' | 'phoneNumber' | 'courseOfStudy'> & {
    phoneNumber: string;
    confirmPassword: string;
    courseOfStudy: string;
    enrollmentYear: string;
  }>({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "student",
    courseOfStudy: "",
    enrollmentYear: "",
  });

  // Redirect if already logged in or if registration was successful
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Clear local error when form data changes
  useEffect(() => {
    setLocalError(null);
  }, [formData]);

  // Clear authError when component mounts or unmounts, or if user navigates away
  useEffect(() => {
    return () => {
      clearError(); // Call clearError on unmount
    };
  }, [clearError]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null); // Clear any previous local errors

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    // Basic validation for student fields if role is student
    if (formData.role === 'student') {
        if (!formData.courseOfStudy) {
            setLocalError("Please select your course of study.");
            return;
        }
        if (!formData.enrollmentYear || isNaN(Number(formData.enrollmentYear))) {
            setLocalError("Please enter a valid enrollment year.");
            return;
        }
    }

    try {
      // Prepare data for backend, ensuring correct types and optional fields
      const dataToSend: RegisterData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      // Conditionally add optional fields if they have values
      if (formData.phoneNumber) {
        dataToSend.phoneNumber = formData.phoneNumber;
      }

      if (formData.role === 'student') {
        if (formData.courseOfStudy) {
          dataToSend.courseOfStudy = formData.courseOfStudy;
        }
        if (formData.enrollmentYear) {
          dataToSend.enrollmentYear = Number(formData.enrollmentYear); // Convert to number
        }
      }

      await register(dataToSend); // Call the register function from AuthContext
      // AuthContext will handle setting user/token and redirecting via useEffect
      // If successful, useEffect will trigger router.push('/dashboard')
    } catch (err) {
      // AuthContext's 'error' state will be updated and displayed by the Alert below
      console.error("Registration failed in component:", err);
    }
  };

  // Handle input changes for text/number fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle select changes for role and courseOfStudy
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset student-specific fields if role changes from student
      ...(name === 'role' && value !== 'student' && {
        courseOfStudy: '',
        enrollmentYear: '',
      }),
    }));
  };

  // Show loading state from AuthContext
  if (authLoading && !user) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
            <p className="text-xl text-gray-700">Loading...</p>
        </div>
    );
  }

  // If user is already logged in, useEffect will redirect. Return null to prevent flicker.
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-10 w-10 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">EduManage</span>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">Create account</CardTitle>
            <CardDescription className="text-center text-gray-600">Join our student management system</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Display local form validation error */}
            {localError && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Registration Error</AlertTitle>
                <AlertDescription>{localError}</AlertDescription>
              </Alert>
            )}
            {/* Display error from AuthContext */}
            {authError && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Registration Failed</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number (optional)"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Role
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === "student" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="courseOfStudy" className="text-sm font-medium text-gray-700">
                      Course of Study
                    </Label>
                    <Select value={formData.courseOfStudy} onValueChange={(value) => handleSelectChange("courseOfStudy", value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select your course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="Web Development">Web Development</SelectItem>
                        <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                        <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="enrollmentYear" className="text-sm font-medium text-gray-700">
                      Enrollment Year
                    </Label>
                    <Input
                      id="enrollmentYear"
                      name="enrollmentYear"
                      type="number"
                      required={formData.role === 'student'}
                      value={formData.enrollmentYear}
                      onChange={handleChange}
                      placeholder="e.g., 2023"
                      className="h-11"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                disabled={authLoading}
              >
                {authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}