import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://ntjftvutadkasgmxeovg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50amZ0dnV0YWRrYXNnbXhlb3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NDM1OTEsImV4cCI6MjA2NjExOTU5MX0.H0sTLGyTNPB1XvAVDl75NWyRnynGaV_9QBgG0-Bvo0k';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };