import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ohwgrmbntunspkchoshf.supabase.co'
const supabaseAnonKey = 'sb_publishable_Jsm82bEkEaS1YLt0Ze901w_dWIjgcLt'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)