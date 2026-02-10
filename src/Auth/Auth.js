// import { createClient } from '@supabase/supabase-js'
// const supabaseUrl = process.env.SUPABASE_URL
// const supabaseKey = process.env.SUPABASE_KEY
// export const supabase = createClient(supabaseUrl, supabaseKey)

import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://gqoajzzpjtmljquwreeu.supabase.co'
const supabaseKey = 'sb_publishable_4PJ7LmyvnoIQSxh8vYMcGw_z4Ea5tts'
export const supabase = createClient(supabaseUrl, supabaseKey)