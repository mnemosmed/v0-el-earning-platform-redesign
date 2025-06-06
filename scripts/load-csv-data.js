// Script to load CSV data into Supabase
const fs = require("fs")
const { createClient } = require("@supabase/supabase-js")
const fetch = require("node-fetch")

// CSV URL
const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Courses-Grid%20view-EJPGaMfpbp4aeZCecJH7tZvTqGck8U.csv"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function loadCSVData() {
  try {
    console.log("Fetching CSV data from URL...")
    const response = await fetch(CSV_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    console.log(`CSV data fetched, length: ${csvText.length} characters`)

    const lines = csvText.split("\n")
    console.log(`CSV contains ${lines.length} lines`)

    // Skip header row
    const header = lines[0]
    console.log(`Header: ${header}`)

    // Parse CSV data
    const coursesToInsert = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line) {
        // Parse CSV line carefully to handle quoted fields
        const values = parseCSVLine(line)

        if (values.length >= 7 && values[0] && values[1] && values[2] && values[6]) {
          coursesToInsert.push({
            title: values[0],
            instructor: values[1],
            category: values[2],
            subcategory: values[3] || null,
            course_url: values[6],
            status: values[7] || "unchecked",
          })
        }
      }
    }

    console.log(`Parsed ${coursesToInsert.length} valid courses`)
    if (coursesToInsert.length > 0) {
      console.log("Sample course:", coursesToInsert[0])
    }

    // Insert data in batches
    const batchSize = 20
    for (let i = 0; i < coursesToInsert.length; i += batchSize) {
      const batch = coursesToInsert.slice(i, i + batchSize)
      console.log(
        `Inserting batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(coursesToInsert.length / batchSize)}`,
      )

      const { data, error } = await supabase.from("courses").insert(batch).select()

      if (error) {
        console.error("Error inserting batch:", error)
        throw error
      }

      console.log(`Successfully inserted ${data.length} records`)
    }

    console.log("CSV data loaded successfully!")

    // Verify data
    const { data: countData, error: countError } = await supabase.from("courses").select("id", { count: "exact" })

    if (countError) {
      console.error("Error counting records:", countError)
    } else {
      console.log(`Total records in database: ${countData.length}`)
    }
  } catch (error) {
    console.error("Error loading CSV data:", error)
  }
}

// Helper function to parse CSV line properly
function parseCSVLine(line) {
  const values = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      values.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  values.push(current.trim()) // Add the last value
  return values.map((v) => v.replace(/^"|"$/g, ""))
}

// Run the function
loadCSVData()
