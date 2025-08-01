// frontend/app/admin/students/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from 'next/navigation';
import Navbar from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, Edit, Trash2, Download, Users, UserCheck, UserX, GraduationCap, Loader2, XCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';

// Define a type for student data matching your backend
interface Student {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  courseOfStudy?: string;
  enrollmentYear?: number;
  status?: "Active" | "Graduated" | "Dropped" | "Suspended";
  profilePicture?: string;
  studentId?: string;
  role: 'student';
}

// Define a type for the form data
interface DialogFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  courseOfStudy: string;
  enrollmentYear: string;
  status: "Active" | "Graduated" | "Dropped" | "Suspended";
  studentId: string;
}

export default function AdminStudentsPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  const [dialogFormData, setDialogFormData] = useState<DialogFormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    courseOfStudy: '',
    enrollmentYear: '',
    status: 'Active',
    studentId: '',
  });

  // --- Fetch Students Data: Wrapped in useCallback to prevent infinite loops ---
  const fetchStudents = useCallback(async () => {
    setApiLoading(true);
    setApiError("");
    try {
      const response = await api.get('/students');
      const data: Student[] = response.data;
      setStudents(data);
    } catch (err: any) {
      console.error("Failed to fetch students:", err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch students. Please check your network or server.';
      setApiError(errorMessage);
    } finally {
      setApiLoading(false);
    }
  }, []); // Empty dependency array means this function is created only once

  // --- Authentication and Authorization Check ---
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchStudents();
      }
    }
  }, [user, loading, router, fetchStudents]);

  // --- Dialog Form Handling ---
  const handleDialogInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setDialogFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleDialogSelectChange = (field: keyof DialogFormData, value: string) => {
    setDialogFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- Corrected Logic for Adding/Editing Student ---
  const handleAddEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiLoading(true);
    setApiError("");
    setApiSuccess("");

    try {
      // Create the base payload from the form data
      const basePayload = {
        fullName: dialogFormData.fullName,
        email: dialogFormData.email,
        studentId: dialogFormData.studentId,
        courseOfStudy: dialogFormData.courseOfStudy,
        enrollmentYear: parseInt(dialogFormData.enrollmentYear, 10),
        phoneNumber: dialogFormData.phoneNumber,
        status: dialogFormData.status,
      };

      if (currentStudent) {
        // EDIT student
        const res = await api.put(`/students/${currentStudent._id}`, basePayload);
        setStudents(students.map(s => s._id === currentStudent._id ? { ...s, ...basePayload as any, _id: currentStudent._id, role: s.role } : s));
        setApiSuccess("Student updated successfully!");
      } else {
        // ADD new student
        const newStudentPayload = {
          ...basePayload,
          role: 'student' as const,
          // The backend requires a password. Add a default password here.
          password: 'P@ssword123',
        };
        const res = await api.post('/students', newStudentPayload);
        const newStudent: Student = res.data;
        setStudents([...students, newStudent]);
        setApiSuccess("Student added successfully!");
      }
      
      // Re-fetch students to ensure the table is perfectly in sync with the database
      fetchStudents();

    } catch (err: any) {
      console.error("API Error:", err.response?.data || err.message);
      setApiError(err.response?.data?.message || (currentStudent ? "Failed to update student." : "Failed to add student."));
    } finally {
      setApiLoading(false);
      setIsAddEditDialogOpen(false);
      setCurrentStudent(null);
      // Clear form data
      setDialogFormData({
        fullName: '', email: '', phoneNumber: '', courseOfStudy: '', enrollmentYear: '', status: 'Active', studentId: ''
      });
      setTimeout(() => setApiSuccess(""), 3000);
      setTimeout(() => setApiError(""), 5000);
    }
  };

  // --- Helper functions to open dialogs ---
  const handleOpenAddDialog = () => {
    setCurrentStudent(null);
    setDialogFormData({
      fullName: '', email: '', phoneNumber: '', courseOfStudy: '', enrollmentYear: '', status: 'Active', studentId: ''
    });
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (student: Student) => {
    setCurrentStudent(student);
    setDialogFormData({
      fullName: student.fullName,
      email: student.email,
      phoneNumber: student.phoneNumber || '',
      courseOfStudy: student.courseOfStudy || '',
      enrollmentYear: student.enrollmentYear ? student.enrollmentYear.toString() : '',
      status: student.status || 'Active',
      studentId: student.studentId || '',
    });
    setIsAddEditDialogOpen(true);
  };

  // --- Delete Student ---
  const handleDeleteStudent = async (_id: string) => {
    if (!window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) return;

    setApiLoading(true);
    setApiError("");
    setApiSuccess("");

    try {
      console.log("Deleting student with ID:", _id);
      await api.delete(`/students/${_id}`);
      setStudents(students.filter((s) => s._id !== _id));
      setApiSuccess("Student deleted successfully!");
    } catch (err: any) {
      console.error("API Error:", err.response?.data || err.message);
      setApiError(err.response?.data?.message || "Failed to delete student.");
    } finally {
      setApiLoading(false);
      setTimeout(() => setApiSuccess(""), 3000);
      setTimeout(() => setApiError(""), 5000);
    }
  };

  // --- Filtering Logic ---
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    const matchesCourse = courseFilter === "all" || student.courseOfStudy === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  // --- Stats Calculation ---
  const stats = [
    {
      title: "Total Students",
      value: students.length.toString(),
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Students",
      value: students.filter((s) => s.status === "Active").length.toString(),
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      title: "Graduated",
      value: students.filter((s) => s.status === "Graduated").length.toString(),
      icon: GraduationCap,
      color: "text-purple-600",
    },
    {
      title: "Dropped / Suspended",
      value: students.filter((s) => s.status === "Dropped" || s.status === "Suspended").length.toString(),
      icon: UserX,
      color: "text-red-600",
    },
  ];

  const getStatusBadgeVariant = (status: string | undefined) => {
    switch (status) {
      case "Active":
        return "default";
      case "Graduated":
        return "secondary";
      case "Dropped":
      case "Suspended":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Show loading/redirect state while authentication is in progress or unauthorized
  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-2" />
        <p className="text-xl text-gray-700">Loading admin panel...</p>
      </div>
    );
  }

  // Render the actual page if authenticated as admin
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600 mt-2">Manage all student records and information</p>
        </div>

        {apiSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{apiSuccess}</AlertDescription>
          </Alert>
        )}
        {apiError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{apiError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search students by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Graduated">Graduated</SelectItem>
                    <SelectItem value="Dropped">Dropped</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" disabled={apiLoading}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleOpenAddDialog} disabled={apiLoading}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{currentStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
                      <DialogDescription>
                        {currentStudent ? "Update the student's information." : "Enter the student's information below."}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddEditStudent}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="fullName" className="text-right">
                            Full Name
                          </Label>
                          <Input
                            id="fullName"
                            value={dialogFormData.fullName}
                            onChange={handleDialogInputChange}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={dialogFormData.email}
                            onChange={handleDialogInputChange}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phoneNumber" className="text-right">
                            Phone
                          </Label>
                          <Input
                            id="phoneNumber"
                            value={dialogFormData.phoneNumber}
                            onChange={handleDialogInputChange}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="studentId" className="text-right">
                            Student ID
                          </Label>
                          <Input
                            id="studentId"
                            value={dialogFormData.studentId}
                            onChange={handleDialogInputChange}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="courseOfStudy" className="text-right">
                            Course
                          </Label>
                          <Select
                            value={dialogFormData.courseOfStudy}
                            onValueChange={(value) => handleDialogSelectChange("courseOfStudy", value)}
                            required
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Computer Science">Computer Science</SelectItem>
                              <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                              <SelectItem value="Data Science">Data Science</SelectItem>
                              <SelectItem value="Web Development">Web Development</SelectItem>
                              <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="enrollmentYear" className="text-right">
                            Enrollment Year
                          </Label>
                          <Input
                            id="enrollmentYear"
                            type="number"
                            value={dialogFormData.enrollmentYear}
                            onChange={handleDialogInputChange}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="status" className="text-right">
                            Status
                          </Label>
                          <Select
                            value={dialogFormData.status}
                            onValueChange={(value) => handleDialogSelectChange("status", value)}
                            required
                          >
                            <SelectTrigger className="col-span-3">
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
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={apiLoading}>
                          {apiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                          {currentStudent ? "Save Changes" : "Add Student"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Students ({filteredStudents.length})</CardTitle>
            <CardDescription>Manage student records and information</CardDescription>
          </CardHeader>
          <CardContent>
            {apiLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mr-2" />
                <p className="text-gray-700">Loading students...</p>
              </div>
            )}
            {!apiLoading && filteredStudents.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No students found matching your criteria.
              </div>
            )}
            {!apiLoading && filteredStudents.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Enrollment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={student.profilePicture || "/placeholder.svg"} alt={student.fullName} />
                              <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                {student.fullName
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{student.fullName}</div>
                              <div className="text-sm text-gray-500">ID: {student.studentId || 'N/A'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm text-gray-900">{student.email}</div>
                            <div className="text-sm text-gray-500">{student.phoneNumber || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">{student.courseOfStudy || 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">{student.enrollmentYear || 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(student.status)}>{student.status || 'Unknown'}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(student)} disabled={apiLoading}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteStudent(student._id)} disabled={apiLoading}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}