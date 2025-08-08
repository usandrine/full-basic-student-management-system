"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Loader2 } from "lucide-react"

import { useAuth } from '../../context/AuthContext';
import AuthForm from "@/components/AuthForm"

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { login, user, loading: authLoading, error: authError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleAuthSubmit = async (formData: LoginFormData) => {
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      console.error("Login failed in component:", err);
    }
  };

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-2" />
        <p className="text-xl text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-10 w-10 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">EduManage</span>
          </div>
        </div>

        <Card className="shadow-xl border-0 rounded-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">Login</CardTitle>
            <CardDescription className="text-center text-gray-600">Access your student management account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <AuthForm
              type="login"
              onSubmit={handleAuthSubmit}
              loading={authLoading}
              error={authError}
            />
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-center text-sm text-gray-600">
              Forgot your password?{" "}
              <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Reset Password
              </Link>
            </div>
            <div className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
