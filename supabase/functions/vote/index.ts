// Vote API Endpoint - Core voting functionality
// Based on specification section 5

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

    // Get user from JWT token
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Parse request body
    const { article_id, choice } = await req.json()

    // Validate input
    if (!article_id || !choice) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: article_id, choice' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (choice !== 'a' && choice !== 'b') {
      return new Response(
        JSON.stringify({ error: 'Invalid choice. Must be "a" or "b"' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Check if article exists and is published
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, status')
      .eq('id', article_id)
      .single()

    if (articleError || !article) {
      return new Response(
        JSON.stringify({ error: 'Article not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (article.status !== 'published') {
      return new Response(
        JSON.stringify({ error: 'Article is not available for voting' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Check if user has already voted on this article
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', user.id)
      .eq('article_id', article_id)
      .single()

    if (existingVote) {
      return new Response(
        JSON.stringify({ error: 'You have already voted on this article' }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Insert the vote (triggers will handle point calculation and odds update)
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert([
        {
          user_id: user.id,
          article_id,
          choice,
        },
      ])
      .select()
      .single()

    if (voteError) {
      console.error('Vote insertion error:', voteError)
      return new Response(
        JSON.stringify({ error: 'Failed to record vote' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Get updated article data with new odds
    const { data: updatedArticle } = await supabase
      .from('articles')
      .select('choice_a_votes, choice_b_votes, choice_a_odds, choice_b_odds')
      .eq('id', article_id)
      .single()

    return new Response(
      JSON.stringify({
        success: true,
        vote,
        updated_odds: {
          choice_a_votes: updatedArticle?.choice_a_votes || 0,
          choice_b_votes: updatedArticle?.choice_b_votes || 0,
          choice_a_odds: updatedArticle?.choice_a_odds || 50.0,
          choice_b_odds: updatedArticle?.choice_b_odds || 50.0,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Vote API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})