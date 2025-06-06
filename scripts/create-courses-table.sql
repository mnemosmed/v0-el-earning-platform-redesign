-- Drop the table if it exists to start fresh
DROP TABLE IF EXISTS courses;

-- Create the courses table with the schema matching the CSV data
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  instructor TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  course_url TEXT NOT NULL,
  status TEXT DEFAULT 'unchecked',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_status ON courses(status);

-- Grant permissions (adjust as needed for your Supabase setup)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public courses are viewable by everyone" ON courses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert courses" ON courses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update courses" ON courses FOR UPDATE USING (auth.role() = 'authenticated');
