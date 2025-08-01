// frontend/app/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation' // For Next.js App Router navigation

import Navbar from "@/components/layout/navbar" // Assuming your Navbar is in this path
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Calendar, GraduationCap, Mail, Phone, User, Edit, Award, Clock, TrendingUp, Loader2 } from "lucide-react" // Import Loader2 for loading state

import { useAuth } from '@/context/AuthContext'; // <--- ADJUSTED IMPORT PATH FOR CONSISTENCY

// Mock data for student stats and courses (replace with actual API calls later)
const mockStats = [
  {
    title: "Current Courses",
    value: "6",
    description: "Active enrollments",
    icon: BookOpen,
    color: "text-blue-600",
  },
  {
    title: "GPA",
    value: "3.8",
    description: "Current semester",
    icon: Award,
    color: "text-green-600",
  },
  {
    title: "Credits",
    value: "45",
    description: "Completed credits",
    icon: TrendingUp,
    color: "text-purple-600",
  },
  {
    title: "Attendance",
    value: "92%",
    description: "This semester",
    icon: Clock,
    color: "text-orange-600",
  },
]

const mockCourses = [
  {
    id: 1,
    name: "Advanced Web Development",
    code: "CS401",
    instructor: "Dr. Sarah Johnson",
    schedule: "Mon, Wed, Fri - 10:00 AM",
    progress: 75,
    grade: "A-",
  },
  {
    id: 2,
    name: "Database Systems",
    code: "CS350",
    instructor: "Prof. Michael Chen",
    schedule: "Tue, Thu - 2:00 PM",
    progress: 60,
    grade: "B+",
  },
  {
    id: 3,
    name: "Software Engineering",
    code: "CS380",
    instructor: "Dr. Emily Rodriguez",
    schedule: "Mon, Wed - 1:00 PM",
    progress: 85,
    grade: "A",
  },
]

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated or if user role requires different dashboard
  useEffect(() => {
    if (!loading) { // Ensure authentication state is resolved
      if (!user) {
        router.push('/login'); // Not authenticated, redirect to login
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard'); // Admin, redirect to admin dashboard
      }
      // If user is present and not admin (i.e., student), proceed to render student dashboard
    }
  }, [user, loading, router]); // Dependencies: user, loading, router

  // --- Render Loading State ---
  // This state is shown while `loading` is true, or if `user` is null/undefined
  // (meaning redirection is pending for unauthenticated users),
  // or if an admin user is temporarily here before redirecting.
  if (loading || !user || (user && user.role === 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-2" />
        <p className="text-xl text-gray-700">Loading dashboard...</p>
      </div>
    );
  }

  // --- Render Student Dashboard (if user exists and is a student) ---
  // At this point, `user` is guaranteed to be defined and `user.role` is 'student'
  // due to the checks above.
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          {/* FIXED: Safe access to user.fullName using optional chaining and nullish coalescing */}
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.fullName?.split(" ")[0] ?? "User"}! 👋
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your studies today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  Profile Information
                  <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    {/* FIXED: Assuming 'profilePicture' is the correct property in your User interface */}
                    <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.fullName} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-600 text-lg">
                      {/* FIXED: Safe access to user.fullName */}
                      {user.fullName
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") ?? ""}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold text-gray-900">{user.fullName}</h3>
                  <Badge variant="secondary" className="mt-2">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">{user.phoneNumber}</span>
                    </div>
                  )}
                  {user.courseOfStudy && (
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">{user.courseOfStudy}</span>
                    </div>
                  )}
                  {user.enrollmentYear && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">Enrolled {user.enrollmentYear}</span>
                    </div>
                  )}
                  {/* Re-enable this if you add `studentId` to your User interface in AuthContext.tsx */}
                  {/* {user.studentId && (
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">ID: {user.studentId}</span>
                    </div>
                  )} */}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Courses - This section would be conditionally rendered or populated by API */}
          <div className="lg:col-span-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Current Courses</CardTitle>
                <CardDescription>Your enrolled courses for this semester</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCourses.map((course) => (
                    <div
                      key={course.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{course.name}</h4>
                          <p className="text-sm text-gray-600">
                            {course.code} • {course.instructor}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{course.schedule}</p>
                        </div>
                        <Badge variant={course.grade.startsWith("A") ? "default" : "secondary"}>{course.grade}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}