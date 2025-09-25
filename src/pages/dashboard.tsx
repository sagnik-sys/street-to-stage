import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/custom-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/integrations/supabase/client"
import { Plus, FileText, Clock, CheckCircle, AlertTriangle, MapPin } from "lucide-react"
import { format } from "date-fns"

interface ReportSummary {
  total: number
  pending: number
  processing: number
  completed: number
}

interface RecentReport {
  id: string
  title: string
  department: string
  status: string
  created_at: string
  location_address: string | null
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [reportSummary, setReportSummary] = useState<ReportSummary>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0
  })
  const [recentReports, setRecentReports] = useState<RecentReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch report summary
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('status')
        .eq('user_id', user?.id)
      
      if (reportsError) throw reportsError

      const summary = reports?.reduce((acc, report) => {
        acc.total++
        acc[report.status as keyof Omit<ReportSummary, 'total'>]++
        return acc
      }, { total: 0, pending: 0, processing: 0, completed: 0 }) || { total: 0, pending: 0, processing: 0, completed: 0 }
      
      setReportSummary(summary)

      // Fetch recent reports
      const { data: recent, error: recentError } = await supabase
        .from('reports')
        .select('id, title, department, status, created_at, location_address')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (recentError) throw recentError
      setRecentReports(recent || [])
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDepartmentLabel = (department: string) => {
    const labels: { [key: string]: string } = {
      'electricity': 'Electricity',
      'pwd': 'Public Works',
      'roads_transport': 'Roads & Transport',
      'garbage_sanitation': 'Garbage & Sanitation',
      'water_supply': 'Water Supply',
      'others': 'Others'
    }
    return labels[department] || department
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'processing':
        return <AlertTriangle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.full_name || 'Citizen'}
          </h1>
          <p className="text-muted-foreground">
            Track your civic reports and help improve your community
          </p>
        </div>
        <Button asChild variant="report" size="lg">
          <Link to="/create-report">
            <Plus className="mr-2 h-5 w-5" />
            Report New Issue
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-card to-muted border-0 shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{reportSummary.total}</div>
            <p className="text-xs text-muted-foreground">All time submissions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning-orange-light to-card border-warning-orange/20 shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-pending">{reportSummary.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-civic-blue-light to-card border-civic-blue/20 shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-processing" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-processing">{reportSummary.processing}</div>
            <p className="text-xs text-muted-foreground">Being addressed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-government-green-light to-card border-government-green/20 shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-status-completed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-completed">{reportSummary.completed}</div>
            <p className="text-xs text-muted-foreground">Issues resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>
                Your latest submissions and their current status
              </CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link to="/my-reports">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No reports yet</h3>
              <p className="mt-2 text-muted-foreground">
                Start by creating your first civic report
              </p>
              <Button asChild variant="civic" className="mt-4">
                <Link to="/create-report">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Report
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-civic-blue-light">
                      {getStatusIcon(report.status)}
                    </div>
                    <div>
                      <h4 className="font-medium">{report.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{getDepartmentLabel(report.department)}</span>
                        {report.location_address && (
                          <>
                            <span>•</span>
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              <span className="truncate max-w-32">{report.location_address}</span>
                            </div>
                          </>
                        )}
                        <span>•</span>
                        <span>{format(new Date(report.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={report.status as any}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </StatusBadge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}