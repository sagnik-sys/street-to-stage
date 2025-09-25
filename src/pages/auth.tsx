import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/custom-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Building2, Loader2 } from "lucide-react"
import { z } from "zod"

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
})

type AuthFormData = z.infer<typeof authSchema>

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    fullName: "",
  })
  const [errors, setErrors] = useState<Partial<AuthFormData>>({})
  const [loading, setLoading] = useState(false)
  
  const { user, signIn, signUp } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  const validateForm = (): boolean => {
    try {
      if (isSignUp) {
        authSchema.parse(formData)
      } else {
        authSchema.omit({ fullName: true }).parse(formData)
      }
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<AuthFormData> = {}
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof AuthFormData] = issue.message
          }
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.fullName!)
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            })
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            })
          }
        } else {
          toast({
            title: "Welcome to Civic Connect!",
            description: "Your account has been created successfully.",
          })
        }
      } else {
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          if (error.message.includes("Invalid") || error.message.includes("credentials")) {
            toast({
              title: "Sign in failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            })
          } else {
            toast({
              title: "Sign in failed",
              description: error.message,
              variant: "destructive",
            })
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof AuthFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-civic-blue-light via-background to-government-green-light p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-card)]">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-civic-blue to-government-green">
              <Building2 className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center bg-gradient-to-r from-civic-blue to-government-green bg-clip-text text-transparent">
            {isSignUp ? "Join Civic Connect" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp 
              ? "Create an account to start reporting civic issues in your community" 
              : "Sign in to access your civic reporting dashboard"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange("fullName")}
                  disabled={loading}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange("email")}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange("password")}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button 
              type="submit" 
              variant="civic" 
              className="w-full" 
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setErrors({})
                setFormData({ email: "", password: "", fullName: "" })
              }}
              className="text-sm text-civic-blue hover:underline"
              disabled={loading}
            >
              {isSignUp 
                ? "Already have an account? Sign in" 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>

          {isSignUp && (
            <Alert className="mt-4">
              <AlertDescription className="text-sm">
                By creating an account, you can report civic issues, track their progress, 
                and help improve your community.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}