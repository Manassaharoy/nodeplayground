import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
const supabaseDatabase = createClient(
  "https://oajxusxzqqhuwzvyniyc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hanh1c3h6cXFodXd6dnluaXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQyMTQ2MDUsImV4cCI6MTk5OTc5MDYwNX0.KdpTS9wVZcHJ7OPHMNMYkfA7RIlt0fyVaN60DixE-tc"
);

module.exports = supabaseDatabase;
