"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Play, List, ArrowLeft, AlertCircle, Database, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase, type Course, SAMPLE_COURSES } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CoursesByCategory {
  [category: string]: Course[]
}

export default function ELearningPlatform() {
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesByCategory, setCoursesByCategory] = useState<CoursesByCategory>({})
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<"sample" | "database">("sample")
  const [databaseConnected, setDatabaseConnected] = useState(false)

  useEffect(() => {
    initializeApplication()
  }, [])

  const initializeApplication = async () => {
    try {
      setLoading(true)
      setError(null)

      // Start with sample data immediately
      console.log("Loading sample course data...")
      processCoursesData(SAMPLE_COURSES)
      setDataSource("sample")

      // Try to connect to database in the background (optional)
      setTimeout(() => {
        tryConnectToDatabase()
      }, 1000)
    } catch (err) {
      console.error("Error initializing application:", err)
      setError("Failed to initialize the application.")
      // Even if there's an error, load sample data
      processCoursesData(SAMPLE_COURSES)
      setDataSource("sample")
    } finally {
      setLoading(false)
    }
  }

  const tryConnectToDatabase = async () => {
    try {
      console.log("Attempting to connect to database...")

      // Check if Supabase is configured
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co"
      ) {
        console.log("Supabase not configured, staying with sample data")
        return
      }

      // Try a simple query with a short timeout
      const { data, error } = (await Promise.race([
        supabase.from("courses").select("*").order("category").order("title"),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Database connection timeout")), 5000)),
      ])) as any

      if (error) {
        console.log("Database query failed:", error.message)
        if (error.message.includes("does not exist")) {
          console.log("Courses table doesn't exist")
        }
        return
      }

      if (data && data.length > 0) {
        console.log("Successfully connected to database, found", data.length, "courses")
        processCoursesData(data)
        setDataSource("database")
        setDatabaseConnected(true)
        setError(null)
      } else {
        console.log("Database connected but no courses found")
        setDatabaseConnected(true)
      }
    } catch (err) {
      console.log("Database connection failed:", err)
      // Don't show error to user, just stay with sample data
    }
  }

  const processCoursesData = (data: Course[]) => {
    setCourses(data)

    // Group courses by category
    const grouped = data.reduce((acc: CoursesByCategory, course) => {
      if (!acc[course.category]) {
        acc[course.category] = []
      }
      acc[course.category].push(course)
      return acc
    }, {})

    setCoursesByCategory(grouped)

    // Set first course as selected by default
    if (data.length > 0) {
      setSelectedCourse(data[0])
    }

    // Expand first category by default
    if (Object.keys(grouped).length > 0) {
      setExpandedCategories(new Set([Object.keys(grouped)[0]]))
    }
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url
  }

  const getCompletedCount = (categoryName: string) => {
    const categoryCourses = coursesByCategory[categoryName] || []
    return categoryCourses.filter((course) => course.status === "checked").length
  }

  const markCourseAsCompleted = async (courseId: number) => {
    try {
      // Update local state first (for immediate UI feedback)
      setCourses(courses.map((course) => (course.id === courseId ? { ...course, status: "checked" } : course)))

      // Update grouped courses
      const updatedGrouped = { ...coursesByCategory }
      Object.keys(updatedGrouped).forEach((category) => {
        updatedGrouped[category] = updatedGrouped[category].map((course) =>
          course.id === courseId ? { ...course, status: "checked" } : course,
        )
      })
      setCoursesByCategory(updatedGrouped)

      // Update selected course if it's the one being marked
      if (selectedCourse?.id === courseId) {
        setSelectedCourse({ ...selectedCourse, status: "checked" })
      }

      // If connected to database, try to update there too
      if (dataSource === "database" && databaseConnected) {
        try {
          const { error } = await supabase
            .from("courses")
            .update({ status: "checked", updated_at: new Date().toISOString() })
            .eq("id", courseId)

          if (error) {
            console.error("Error updating course status in database:", error)
            // Don't show error to user, local state is already updated
          }
        } catch (dbError) {
          console.error("Database update failed:", dbError)
          // Don't show error to user, local state is already updated
        }
      }
    } catch (err) {
      console.error("Error marking course as completed:", err)
      setError("Failed to mark course as completed.")
    }
  }

  const retryDatabaseConnection = () => {
    setError(null)
    tryConnectToDatabase()
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 bg-gray-900 text-white overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Contents</h2>

          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white p-2 mb-2"
            onClick={() => setSelectedCourse(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK TO COURSE CATALOG
          </Button>

          <div className="mt-4">
            <h3 className="font-medium text-sm text-gray-300 mb-2">Medical Education Platform</h3>
            <p className="text-xs text-gray-400">Professional Medical Training</p>
            <p className="text-xs text-gray-500 mt-1">{courses.length} courses available</p>

            <div className="flex items-center gap-2 mt-2">
              {dataSource === "sample" ? (
                <Badge variant="outline" className="bg-yellow-800 text-yellow-200 border-yellow-700">
                  <Database className="w-3 h-3 mr-1" />
                  Sample Data
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-800 text-green-200 border-green-700">
                  <Wifi className="w-3 h-3 mr-1" />
                  Database
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {Object.entries(coursesByCategory).map(([category, categoryCourses]) => (
            <div key={category} className="border-b border-gray-700">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full p-4 text-left hover:bg-gray-800 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {expandedCategories.has(category) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="font-medium">{category}</span>
                </div>
                <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                  {getCompletedCount(category)}/{categoryCourses.length}
                </Badge>
              </button>

              {expandedCategories.has(category) && (
                <div className="pb-2">
                  {categoryCourses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className={`w-full p-3 pl-8 text-left text-sm hover:bg-gray-800 transition-colors flex items-start gap-3 ${
                        selectedCourse?.id === course.id ? "bg-gray-800 border-r-2 border-blue-500" : ""
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          course.status === "checked" ? "bg-green-500" : "bg-gray-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-200 font-medium leading-tight mb-1">{course.title}</p>
                        <p className="text-gray-400 text-xs">{course.instructor}</p>
                        {course.subcategory && (
                          <p className="text-gray-500 text-xs mt-1">Duration: {course.subcategory}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-10"
          >
            <List className="w-4 h-4" />
          </Button>
        )}

        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {dataSource === "sample" && (
          <Alert className="m-4 bg-blue-50 border-blue-200">
            <Database className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Demo Mode</AlertTitle>
            <AlertDescription className="text-blue-700">
              You're viewing sample course data. To connect to your database, configure your Supabase environment
              variables.
              {!databaseConnected && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-700 underline ml-1"
                  onClick={retryDatabaseConnection}
                >
                  Retry connection
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {selectedCourse ? (
          <div className="flex-1 flex flex-col">
            {/* Video Player */}
            <div className="bg-black flex-shrink-0">
              <div className="aspect-video">
                <iframe
                  src={getYouTubeEmbedUrl(selectedCourse.course_url)}
                  className="w-full h-full"
                  allowFullScreen
                  title={selectedCourse.title}
                />
              </div>
            </div>

            {/* Course Info */}
            <div className="flex-1 bg-white">
              <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h1>
                    <p className="text-gray-600 mb-4">Instructor: {selectedCourse.instructor}</p>
                    <div className="flex gap-2 mb-4">
                      <Badge variant="outline">{selectedCourse.category}</Badge>
                      {selectedCourse.status === "checked" ? (
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      ) : (
                        <Badge variant="secondary">Not Completed</Badge>
                      )}
                      {selectedCourse.subcategory && (
                        <Badge variant="outline">Duration: {selectedCourse.subcategory}</Badge>
                      )}
                    </div>
                  </div>

                  {selectedCourse.status !== "checked" && (
                    <Button onClick={() => markCourseAsCompleted(selectedCourse.id)} className="ml-4">
                      Mark as Completed
                    </Button>
                  )}
                </div>

                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-4">Course Overview</h3>
                  <p className="text-gray-700 mb-4">
                    This comprehensive medical education video covers essential concepts in{" "}
                    {selectedCourse.category.toLowerCase()}. Led by {selectedCourse.instructor}, this session provides
                    in-depth knowledge and practical insights for medical students and healthcare professionals.
                  </p>
                  <h4 className="font-semibold text-gray-900 mb-2">Learning Objectives:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Understand key concepts and principles</li>
                    <li>Apply theoretical knowledge to practical scenarios</li>
                    <li>Develop critical thinking skills in medical decision-making</li>
                    <li>Enhance clinical competency and patient care</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Course Catalog View */
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Medical Education Platform</h1>
              </div>

              {courses.length === 0 ? (
                <Card className="p-6 text-center">
                  <h2 className="text-xl font-semibold mb-4">No courses available</h2>
                  <p className="text-gray-600 mb-6">There was an issue loading the course data.</p>
                  <Button onClick={initializeApplication}>Retry Loading Courses</Button>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(coursesByCategory).map(([category, categoryCourses]) => (
                    <Card key={category} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{category}</h3>
                        <p className="text-gray-600 mb-4">{categoryCourses.length} courses available</p>
                        <div className="space-y-2 mb-4">
                          {categoryCourses.slice(0, 3).map((course) => (
                            <div key={course.id} className="text-sm text-gray-700 flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  course.status === "checked" ? "bg-green-500" : "bg-gray-400"
                                }`}
                              />
                              {course.title.length > 50 ? `${course.title.substring(0, 50)}...` : course.title}
                            </div>
                          ))}
                          {categoryCourses.length > 3 && (
                            <p className="text-sm text-gray-500">+{categoryCourses.length - 3} more courses</p>
                          )}
                        </div>
                        <Button
                          onClick={() => {
                            setExpandedCategories(new Set([category]))
                            setSidebarOpen(true)
                            setSelectedCourse(categoryCourses[0])
                          }}
                          className="w-full"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Learning
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
