import React from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/custom-button"
import { useAuth } from "@/hooks/use-auth"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Building2, FileText, Settings, LogOut, Plus, Home } from "lucide-react"

export function Navbar() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-civic-blue to-government-green">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-civic-blue to-government-green bg-clip-text text-transparent">
            Civic Connect
          </span>
        </Link>

        {/* Navigation Links */}
        {user && (
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                isActive('/') 
                  ? 'bg-civic-blue-light text-civic-blue' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/create-report"
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                isActive('/create-report') 
                  ? 'bg-civic-blue-light text-civic-blue' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Report Issue</span>
            </Link>
            
            <Link
              to="/my-reports"
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                isActive('/my-reports') 
                  ? 'bg-civic-blue-light text-civic-blue' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>My Reports</span>
            </Link>

            {profile?.role === 'admin' || profile?.role === 'superadmin' ? (
              <Link
                to="/admin"
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                  isActive('/admin') 
                    ? 'bg-government-green-light text-government-green' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            ) : null}
          </div>
        )}

        {/* User Menu or Auth Buttons */}
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-civic-blue text-white">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{profile?.full_name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  {profile?.role && (
                    <p className="text-xs leading-none text-civic-blue font-medium capitalize">
                      {profile.role}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild variant="civic">
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}