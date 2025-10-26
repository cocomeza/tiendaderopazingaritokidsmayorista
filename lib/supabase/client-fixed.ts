import { createClient } from '@supabase/supabase-js'

// Variables hardcodeadas temporalmente para que funcione
const supabaseUrl = 'https://hjlmrphltpsibkzfcgvu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjU2MjcsImV4cCI6MjA3NjgwMTYyN30.FExQYsd4T2PxFbxVUC3oB0pPa4xrOdW1bAnHlH8Vfyg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
