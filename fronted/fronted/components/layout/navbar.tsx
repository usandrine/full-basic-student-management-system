// frontend/components/layout/navbar.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, GraduationCap, User, LogOut, Settings } from "lucide-react"

import { useAuth } from '@/context/AuthContext'; // <--- IMPORT useAuth HOOK HERE!

// IMPORTANT: This UserData interface MUST EXACTLY match the User interface in your AuthContext.tsx
interface UserData {
  _id: string;
  fullName: string;
  email: string;
  role: 'student' | 'admin';
  phoneNumber?: string;
  profilePicture?: string;
  courseOfStudy?: string;
  enrollmentYear?: number;
  status?: string;
}

interface NavbarProps {
  user: UserData | null | undefined;
}

export default function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { logout } = useAuth(); // <--- CALL useAuth TO GET THE LOGOUT FUNCTION!

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from your AuthContext
      // AuthContext's logout should ideally handle redirecting to /login or / after successful logout
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">EduManage</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin/students"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Manage Students
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Profile
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.fullName ?? ""} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          {user.fullName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") ?? ""}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.fullName}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-indigo-600 capitalize">{user.role}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {/* FIXED: Add onClick handler for logout */}
                    <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin/students"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    >
                      Manage Students
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  >
                    Profile
                  </Link>
                  <div className="border-t border-gray-200 pt-4 pb-3">
                    <div className="flex items-center px-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.fullName ?? ""} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          {user.fullName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") ?? ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">{user.fullName}</div>
                        <div className="text-sm font-medium text-gray-500">{user.email}</div>
                        <div className="text-xs text-indigo-600 capitalize">{user.role}</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 px-2">
                      {/* FIXED: Add onClick handler for logout */}
                      <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}