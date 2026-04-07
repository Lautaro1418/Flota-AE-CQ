import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Solo crear el cliente si las variables están configuradas
// Si no, exportar un proxy que devuelve errores controlados
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : new Proxy({}, {
      get: () => () => new Proxy({}, {
        get: () => () => ({ data: null, error: { message: 'Supabase no configurado' } })
      })
    })
