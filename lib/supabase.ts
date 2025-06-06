import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Course = {
  id: number
  title: string
  instructor: string
  category: string
  subcategory: string | null
  course_url: string
  status: string
  created_at: string
  updated_at: string
}

// Comprehensive sample course data
export const SAMPLE_COURSES = [
  {
    id: 1,
    title: "Airway assessment and management part 2",
    instructor: "Dr. Julius Azadong Nimbare",
    category: "Anaesthesia",
    subcategory: "151.000",
    course_url: "https://youtu.be/L6ttFpdexgs",
    status: "checked",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Airway assessment and management part 1",
    instructor: "Dr. Julius Azadong Nimbare",
    category: "Anaesthesia",
    subcategory: "145.000",
    course_url: "https://youtu.be/dQw4w9WgXcQ",
    status: "unchecked",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Basic Surgical Techniques",
    instructor: "Dr. Sarah Johnson",
    category: "Surgery",
    subcategory: "120.000",
    course_url: "https://youtu.be/example1",
    status: "checked",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: "Advanced Cardiac Procedures",
    instructor: "Dr. Michael Chen",
    category: "Cardiology",
    subcategory: "180.000",
    course_url: "https://youtu.be/example2",
    status: "unchecked",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    title: "Pediatric Emergency Care",
    instructor: "Dr. Emily Rodriguez",
    category: "Pediatrics",
    subcategory: "90.000",
    course_url: "https://youtu.be/example3",
    status: "checked",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    title: "Orthopedic Assessment",
    instructor: "Dr. James Wilson",
    category: "Orthopedics",
    subcategory: "135.000",
    course_url: "https://youtu.be/example4",
    status: "unchecked",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 7,
    title: "Neurological Examination",
    instructor: "Dr. Lisa Thompson",
    category: "Neurology",
    subcategory: "165.000",
    course_url: "https://youtu.be/example5",
    status: "checked",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 8,
    title: "Respiratory Physiology",
    instructor: "Dr. Robert Davis",
    category: "Pulmonology",
    subcategory: "110.000",
    course_url: "https://youtu.be/example6",
    status: "unchecked",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 9,
    title: "Infectious Disease Management",
    instructor: "Dr. Maria Garcia",
    category: "Infectious Disease",
    subcategory: "140.000",
    course_url: "https://youtu.be/example7",
    status: "checked",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 10,
    title: "Dermatology Basics",
    instructor: "Dr. David Kim",
    category: "Dermatology",
    subcategory: "95.000",
    course_url: "https://youtu.be/example8",
    status: "unchecked",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]
