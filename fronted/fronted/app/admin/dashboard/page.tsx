"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Navbar from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Users, UserCheck, UserX, GraduationCap, TrendingUp, TrendingDown, AlertCircle, Loader2 } from "lucide-react"

import { useAuth } from '@/context/AuthContext';

// Mock data (replace with actual data fetched from your backend in a real app)
const stats = [
  {
    title: "Total Students",
    value: "2,547",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
  },
  {
    title: "Active Students",
    value: "2,234",
    change: "+8%",
    trend: "up",
    icon: UserCheck,
    color: "text-green-600",
  },
  {
    title: "Graduated",
    value: "245",
    change: "+15%",
    trend: "up",
    icon: GraduationCap,
    color: "text-purple-600",
  },
  {
    title: "Dropped Out",
    value: "68",
    change: "-5%",
    trend: "down",
    icon: UserX,
    color: "text-red-600",
  },
]

const courseStats = [
  {
    course: "Computer Science",
    students: 856,
    completion: 92,
    color: "bg-blue-500",
  },
  {
    course: "Software Engineering",
    students: 634,
    completion: 88,
    color: "bg-green-500",
  },
  {
    course: "Data Science",
    students: 423,
    completion: 85,
    color: "bg-purple-500",
  },
  {
    course: "Web Development",
    students: 389,
    completion: 90,
    color: "bg-orange-500",
  },
  {
    course: "Cybersecurity",
    students: 245,
    completion: 87,
    color: "bg-red-500",
  },
]

const recentActivities = [
  {
    id: 1,
    type: "enrollment",
    message: "John Doe enrolled in Computer Science",
    time: "2 hours ago",
    avatar: "/placeholder.svg?height=32&width=32&text=JD",
  },
  {
    id: 2,
    type: "graduation",
    message: "Sarah Wilson graduated from Data Science",
    time: "4 hours ago",
    avatar: "/placeholder.svg?height=32&width=32&text=SW",
  },
  {
    id: 3,
    type: "update",
    message: "Mike Johnson updated his profile",
    time: "6 hours ago",
    avatar: "/placeholder.svg?height=32&width=32&text=MJ",
  },
  {
    id: 4,
    type: "enrollment",
    message: "Emma Davis enrolled in Web Development",
    time: "8 hours ago",
    avatar: "/placeholder.svg?height=32&width=32&text=ED",
  },
]

const alerts = [
  {
    id: 1,
    type: "warning",
    message: "15 students have not logged in for over 30 days",
    action: "View Details",
  },
  {
    id: 2,
    type: "info",
    message: "New semester enrollment opens in 5 days",
    action: "Prepare",
  },
  {
    id: 3,
    type: "success",
    message: "Monthly report generated successfully",
    action: "Download",
  },
]

export default function AdminDashboardPage() {
  // We're only using `user` and `loading` here, so we remove the unused `logout`
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect logic for authentication and role-based access
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push('/login');
      } else if (user.role !== 'admin') {
        // Authenticated but not an admin, redirect to their respective dashboard or unauthorized page
        if (user.role === 'student') {
          router.push('/dashboard'); // Student dashboard
        } else {
          // Handle other roles or a general unauthorized page
          router.push('/unauthorized'); // Create an unauthorized page if needed
        }
      }
    }
  }, [user, loading, router]);

  // Show loading state while authentication status is being determined
  if (loading || !user || (user && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-2" />
        <p className="text-xl text-gray-700">Loading admin dashboard...</p>
      </div>
    );
  }

  // If user is authenticated and is an admin, render the dashboard
  if (user && user.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navbar will receive the authenticated admin user object */}
        <Navbar user={user} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.fullName || user.email}! 👋</h1>
            <p className="text-gray-600 mt-2">Overview of your student management system</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <div className="flex items-center mt-1">
                        {stat.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span
                          className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
                        >
                          {stat.change}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">vs last month</span>
                      </div>
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
            {/* Course Statistics */}
            <div className="lg:col-span-2">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Course Statistics</CardTitle>
                  <CardDescription>Student enrollment and completion rates by course</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {courseStats.map((course, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${course.color}`} />
                            <span className="font-medium text-gray-900">{course.course}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{course.students} students</div>
                            <div className="text-xs text-gray-500">{course.completion}% completion</div>
                          </div>
                        </div>
                        <Progress value={course.completion} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <div>
              <Card className="hover:shadow-md transition-shadow mb-6">
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest student activities and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activity.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs">
                            {/* This fallback logic assumes avatar string contains "text=XX" */}
                            {activity.avatar.includes("text=") ? activity.avatar.split("text=")[1] : ''}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>Important notifications and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg border ${
                          alert.type === "warning"
                            ? "bg-yellow-50 border-yellow-200"
                            : alert.type === "success"
                              ? "bg-green-50 border-green-200"
                              : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2">
                            <AlertCircle
                              className={`h-4 w-4 mt-0.5 ${
                                alert.type === "warning"
                                  ? "text-yellow-600"
                                  : alert.type === "success"
                                    ? "text-green-600"
                                    : "text-blue-600"
                              }`}
                            />
                            <p className="text-sm text-gray-900">{alert.message}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs">
                            {alert.action}
                          </Button>
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
    )
  }

  // Fallback for any other unexpected state
  return null;
}
