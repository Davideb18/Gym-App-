import { createClient } from '@supabase/supabase-js';

// Queste costanti verranno dal tuo pannello Supabase (Settings -> API)
const supabaseUrl = 'https://avvcjadkhdwkrsbgvnio.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dmNqYWRraGR3a3JzYmd2bmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NTE4NjYsImV4cCI6MjA4OTIyNzg2Nn0.bCOC8Bufsa2pOW1SS5bLJXV1sEhJE2k6fPHwxQXOT2s'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
