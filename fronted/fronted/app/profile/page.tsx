// frontend/app/profile/page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation';
import Navbar from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Save, Lock, CheckCircle, Loader2, XCircle } from "lucide-react"

import { useAuth } from '../../context/AuthContext';
import api from '@/utils/api';

interface UserProfile {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    courseOfStudy?: string;
    enrollmentYear?: number;
    studentId?: string;
    status?: "Active" | "Graduated" | "Dropped" | "Suspended";
    profilePicture?: string;
    role?: 'student' | 'admin';
}


export default function ProfilePage() {
    const { user, loading, updateUser } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        courseOfStudy: '',
        enrollmentYear: '',
        status: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else {
                setFormData({
                    fullName: user.fullName || '',
                    email: user.email || '',
                    phoneNumber: user.phoneNumber || '',
                    courseOfStudy: user.role === 'student' ? (user.courseOfStudy || '') : '',
                    enrollmentYear: (user as UserProfile).enrollmentYear?.toString() || '',
                    status: (user as UserProfile).status || '',
                });
            }
        }
    }, [user, loading, router]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccess("");
        setError("");

        try {
            const payload = {
                ...formData,
                enrollmentYear: formData.enrollmentYear ? parseInt(formData.enrollmentYear, 10) : undefined,
            };
            
            const response = await api.put(`/users/profile`, payload);

            if (updateUser) {
                updateUser(response.data);
            }

            setSuccess("Profile updated successfully!");
        } catch (err: any) {
            console.error("Profile update error:", err);
            setError(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setIsLoading(false);
            setTimeout(() => setSuccess(""), 3000);
            setTimeout(() => setError(""), 5000);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccess("");
        setError("");

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError("New password and confirm password do not match.");
            setIsLoading(false);
            return;
        }

        try {
            await api.put('/users/change-password', passwordData);

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setSuccess("Password updated successfully!");
        } catch (err: any) {
            console.error("Password update error:", err);
            setError(err.response?.data?.message || "Failed to update password.");
        } finally {
            setIsLoading(false);
            setTimeout(() => setSuccess(""), 3000);
            setTimeout(() => setError(""), 5000);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handlePasswordChange = (field: string, value: string) => {
        setPasswordData((prev) => ({ ...prev, [field]: value }));
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-2" />
                <p className="text-xl text-gray-700">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user!} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
                </div>

                {success && (
                    <Alert className="mb-6 border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                )}
                {error && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="profile" className="space-y-6">
                    {/* RESTORED: Use flex for tabs for a better horizontal layout */}
                    <TabsList className="flex w-full justify-between items-center bg-gray-100 rounded-md p-1">
                        <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
                        <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
                        <TabsTrigger value="notifications" className="flex-1">Notifications</TabsTrigger>
                        <TabsTrigger value="privacy" className="flex-1">Privacy</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your personal information and profile details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center space-x-6">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.fullName || user.email} />
                                        <AvatarFallback className="bg-indigo-100 text-indigo-600 text-lg">
                                            {user.fullName
                                                ? user.fullName.split(" ").map((n) => n[0]).join("")
                                                : (user.email ? user.email[0].toUpperCase() : '')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <Button variant="outline" className="mb-2 bg-transparent">
                                            <Camera className="h-4 w-4 mr-2" />
                                            Change Photo
                                        </Button>
                                        <p className="text-sm text-gray-500">JPG, GIF or PNG. 1MB max.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Full Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Full Name</Label>
                                            <Input
                                                id="fullName"
                                                value={formData.fullName}
                                                onChange={(e) => handleChange("fullName", e.target.value)}
                                            />
                                        </div>
                                        {/* Email Address */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleChange("email", e.target.value)}
                                                disabled={true}
                                            />
                                        </div>
                                        {/* Phone Number */}
                                        <div className="space-y-2">
                                            <Label htmlFor="phoneNumber">Phone Number</Label>
                                            <Input
                                                id="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                                            />
                                        </div>
                                        {/* Conditionally render student fields */}
                                        {user.role === "student" && (
                                            <>
                                                {/* Course of Study */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="courseOfStudy">Course of Study</Label>
                                                    <Select
                                                        value={formData.courseOfStudy}
                                                        onValueChange={(value) => handleChange("courseOfStudy", value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a course" />
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
                                                {/* Student ID */}
                                                <div className="space-y-2">
                                                    <Label>Student ID</Label>
                                                    <Input value={(user as UserProfile).studentId || ''} disabled />
                                                </div>
                                                {/* Enrollment Year */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="enrollmentYear">Enrollment Year</Label>
                                                    <Input
                                                        id="enrollmentYear"
                                                        type="number"
                                                        value={formData.enrollmentYear}
                                                        onChange={(e) => handleChange("enrollmentYear", e.target.value)}
                                                    />
                                                </div>
                                                {/* Status */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="status">Status</Label>
                                                    <Select
                                                        value={formData.status}
                                                        onValueChange={(value) => handleChange("status", value)}
                                                        disabled={true}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Active">Active</SelectItem>
                                                            <SelectItem value="Graduated">Graduated</SelectItem>
                                                            <SelectItem value="Dropped">Dropped</SelectItem>
                                                            <SelectItem value="Suspended">Suspended</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isLoading}>
                                            <Save className="h-4 w-4 mr-2" />
                                            {isLoading ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>Update your password to keep your account secure</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isLoading}>
                                            <Lock className="h-4 w-4 mr-2" />
                                            {isLoading ? "Updating..." : "Update Password"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Two-Factor Authentication</CardTitle>
                                <CardDescription>Add an extra layer of security to your account</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Authenticator App</p>
                                        <p className="text-sm text-gray-500">Use an authenticator app to generate codes</p>
                                    </div>
                                    <Button variant="outline">Enable</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Choose what notifications you want to receive</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Email Notifications</p>
                                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                                    </div>
                                    <input type="checkbox" className="toggle" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Course Updates</p>
                                        <p className="text-sm text-gray-500">Get notified about course changes</p>
                                    </div>
                                    <input type="checkbox" className="toggle" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Grade Updates</p>
                                        <p className="text-sm text-gray-500">Receive grade notifications</p>
                                    </div>
                                    <input type="checkbox" className="toggle" defaultChecked />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="privacy" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Privacy Settings</CardTitle>
                                <CardDescription>Control your privacy and data sharing preferences</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Profile Visibility</p>
                                        <p className="text-sm text-gray-500">Make your profile visible to other students</p>
                                    </div>
                                    <input type="checkbox" className="toggle" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Data Analytics</p>
                                        <p className="text-sm text-gray-500">Help improve our services with usage data</p>
                                    </div>
                                    <input type="checkbox" className="toggle" defaultChecked />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
