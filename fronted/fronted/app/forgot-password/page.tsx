"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from '@/context/AuthContext';

// Custom component for success alerts
const SuccessAlert = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start space-x-2 p-4 rounded-md bg-green-100 text-green-700">
    <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
    <div className="flex-1">
      {children}
    </div>
  </div>
);

export default function ForgotPasswordPage() {
  const { loading, error, requestPasswordReset } = useAuth();
  
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setMessage('');
    
    if (!email) {
      setFormError('Please enter your email address.');
      return;
    }
    
    // Call the new password reset function from AuthContext
    const result = await requestPasswordReset(email);
    
    if (result.success) {
      setMessage(result.message);
    } else {
      setFormError(result.message);
    }
  };

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
            <CardTitle className="text-2xl font-bold text-center text-gray-900">Forgot Password</CardTitle>
            <CardDescription className="text-center text-gray-600">Enter your email to receive a password reset link.</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {message && (
              <SuccessAlert>
                <AlertDescription>{message}</AlertDescription>
              </SuccessAlert>
            )}
            {formError && (
              <Alert variant="destructive">
                <AlertDescription className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-red-600" />
                  <span>{formError}</span>
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardHeader className="flex flex-col space-y-4 pt-6">
            <div className="text-center text-sm text-gray-600">
              Remember your password?{" "}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Back to Login
              </Link>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
