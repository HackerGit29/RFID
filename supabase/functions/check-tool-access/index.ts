import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  try {
    const { tool_uid, checkpoint_id } = await req.json()

    if (!tool_uid || !checkpoint_id) {
      return new Response(
        JSON.stringify({ error: 'Missing tool_uid or checkpoint_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 1. Find tool by RFID UID
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('*')
      .eq('serial_number', tool_uid) // Using serial_number as the UID mapping for prototype
      .single()

    if (toolError || !tool) {
      // Handle unknown tags as unauthorized
      await logMovement(tool_uid, null, 'RFID_OUT', checkpoint_id, false)
      return new Response(
        JSON.stringify({ authorized: false, message: 'Unknown tool' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 2. Check if the tool is in 'authorized' state
    const isAuthorized = tool.state === 'authorized'

    // 3. Log the movement
    await logMovement(tool_uid, tool.id, isAuthorized ? 'RFID_OUT' : 'RFID_ALARM', checkpoint_id, isAuthorized)

    return new Response(
      JSON.stringify({
        authorized: isAuthorized,
        tool_name: tool.name,
        state: tool.state
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function logMovement(uid: string, toolId: string | null, type: string, checkpointId: string, authorized: boolean) {
  await supabase.from('tool_logs').insert({
    tool_id: toolId,
    tool_uid: uid,
    type: type,
    checkpoint_id: checkpointId,
    authorized: authorized,
    timestamp: new Date().toISOString()
  })
}
