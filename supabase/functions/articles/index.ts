// Articles API Endpoint - Fetch articles with pagination and filtering
// Based on specification requirements

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
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const status = url.searchParams.get('status') || 'published'
    const articleId = url.searchParams.get('id')

    // Calculate pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // If requesting a specific article
    if (articleId) {
      const { data: article, error } = await supabase
        .from('articles')
        .select(`
          *,
          created_by:users!articles_created_by_fkey(
            id,
            nickname,
            avatar_url
          )
        `)
        .eq('id', articleId)
        .single()

      if (error || !article) {
        return new Response(
          JSON.stringify({ error: 'Article not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      // Check if user has voted on this article (if authenticated)
      let userVote = null
      const authHeader = req.headers.get('Authorization')
      if (authHeader) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: vote } = await supabase
            .from('votes')
            .select('choice')
            .eq('user_id', user.id)
            .eq('article_id', articleId)
            .single()
          
          userVote = vote?.choice || null
        }
      }

      return new Response(
        JSON.stringify({
          article: {
            ...article,
            user_vote: userVote
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Build query for article list
    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        content,
        thumbnail_url,
        choice_a_text,
        choice_b_text,
        choice_a_votes,
        choice_b_votes,
        choice_a_odds,
        choice_b_odds,
        status,
        created_at,
        created_by:users!articles_created_by_fkey(
          id,
          nickname,
          avatar_url
        )
      `, { count: 'exact' })

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply pagination and ordering
    const { data: articles, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Articles fetch error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch articles' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Get user votes for these articles (if authenticated)
    const userVotes: { [key: string]: string } = {}
    const authHeader = req.headers.get('Authorization')
    if (authHeader && articles && articles.length > 0) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const articleIds = articles.map(a => a.id)
        const { data: votes } = await supabase
          .from('votes')
          .select('article_id, choice')
          .eq('user_id', user.id)
          .in('article_id', articleIds)
        
        if (votes) {
          votes.forEach(vote => {
            userVotes[vote.article_id] = vote.choice
          })
        }
      }
    }

    // Add user vote information to articles
    const articlesWithVotes = articles?.map(article => ({
      ...article,
      user_vote: userVotes[article.id] || null
    }))

    return new Response(
      JSON.stringify({
        articles: articlesWithVotes || [],
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
    console.error('Articles API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})