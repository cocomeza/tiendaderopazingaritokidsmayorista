import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== '') 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL 
  : 'https://hjlmrphltpsibkzfcgvu.supabase.co'

const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim() !== '')
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0MTcyNDcsImV4cCI6MjA0NDk5MzI0N30.jGIQi0XxFxJ2Nqhyz8a8_8Q3j_GfT5J7V1K7L8V9L0c'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
