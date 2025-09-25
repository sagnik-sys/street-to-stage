import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/custom-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, FileText, Users, Shield, MapPin, Camera, Mic } from "lucide-react"
import Dashboard from "./dashboard"

const Index = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Show dashboard if user is authenticated
  if (!loading && user) {
    return <Dashboard />
  }

  // Show landing page for unauthenticated users
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-civic-blue-light via-background to-government-green-light py-20 px-4">
        <div className="container max-w-6xl text-center space-y-8">
          <div className="flex justify-center mb-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-civic-blue to-government-green shadow-[var(--shadow-civic)]">
              <Building2 className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-civic-blue to-government-green bg-clip-text text-transparent">
              Civic Connect
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Report government issues, track progress, and help improve your community. 
            Your voice matters in building a better civic environment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => navigate("/auth")}
              variant="civic" 
              size="xl"
              className="w-full sm:w-auto"
            >
              <FileText className="mr-2 h-5 w-5" />
              Start Reporting Issues
            </Button>
            <Button 
              onClick={() => navigate("/auth")}
              variant="outline" 
              size="xl"
              className="w-full sm:w-auto"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Civic Connect Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform for citizens to report issues and track government response
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-[var(--shadow-card)] border-0 bg-gradient-to-br from-card to-muted hover:shadow-[var(--shadow-civic)] transition-all duration-300">
              <CardHeader>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-civic-blue-light mx-auto mb-4">
                  <Camera className="h-8 w-8 text-civic-blue" />
                </div>
                <CardTitle>Rich Media Reports</CardTitle>
                <CardDescription>
                  Capture issues with photos, videos, and voice notes. Add detailed descriptions 
                  to help officials understand the problem.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center shadow-[var(--shadow-card)] border-0 bg-gradient-to-br from-card to-muted hover:shadow-[var(--shadow-civic)] transition-all duration-300">
              <CardHeader>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-government-green-light mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-government-green" />
                </div>
                <CardTitle>Auto-Location Detection</CardTitle>
                <CardDescription>
                  Your location is automatically detected and mapped using OpenStreetMap 
                  for precise issue tracking and response.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center shadow-[var(--shadow-card)] border-0 bg-gradient-to-br from-card to-muted hover:shadow-[var(--shadow-civic)] transition-all duration-300">
              <CardHeader>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning-orange-light mx-auto mb-4">
                  <Shield className="h-8 w-8 text-warning-orange" />
                </div>
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>
                  Monitor your reports from submission to resolution. Get updates when 
                  officials review and take action on your issues.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-muted/50 to-background">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Report to the Right Department
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from various government departments to ensure your report reaches the right officials
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Electricity", icon: "⚡", color: "warning-orange" },
              { name: "Public Works", icon: "🏗️", color: "civic-blue" },
              { name: "Roads & Transport", icon: "🚗", color: "government-green" },
              { name: "Garbage & Sanitation", icon: "🗑️", color: "civic-blue" },
              { name: "Water Supply", icon: "💧", color: "government-green" },
              { name: "Others", icon: "📋", color: "warning-orange" },
            ].map((dept) => (
              <Card key={dept.name} className="text-center p-6 shadow-[var(--shadow-card)] border-0 hover:shadow-[var(--shadow-civic)] transition-all duration-300">
                <div className="text-4xl mb-3">{dept.icon}</div>
                <h3 className="font-semibold text-lg">{dept.name}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-civic-blue to-government-green">
        <div className="container max-w-4xl text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of citizens working together to improve our communities. 
            Your reports help create positive change.
          </p>
          <Button 
            onClick={() => navigate("/auth")}
            variant="secondary" 
            size="xl"
            className="bg-white text-civic-blue hover:bg-gray-100"
          >
            <Users className="mr-2 h-5 w-5" />
            Get Started Today
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
