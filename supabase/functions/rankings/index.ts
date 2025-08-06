// Rankings API Endpoint - User leaderboard by points
// Based on specification section 2.5

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')

    // Calculate pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Get rankings using the view we created
    const { data: rankings, error, count } = await supabase
      .from('user_rankings')
      .select('*', { count: 'exact' })
      .range(from, to)

    if (error) {
      console.error('Rankings fetch error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch rankings' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Get current user's ranking if authenticated
    let currentUserRank = null
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userRanking } = await supabase
          .from('user_rankings')
          .select('rank, total_points')
          .eq('id', user.id)
          .single()
        
        if (userRanking) {
          currentUserRank = {
            rank: userRanking.rank,
            points: userRanking.total_points
          }
        }
      }
    }

    // Get total number of users with points for statistics
    const { count: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gt('total_points', 0)

    return new Response(
      JSON.stringify({
        rankings: rankings || [],
        current_user_rank: currentUserRank,
        statistics: {
          total_ranked_users: totalUsers || 0
        },
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Rankings API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})