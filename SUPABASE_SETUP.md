# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new account
2. Create a new project
3. Note down your project URL and anon key

## 2. Environment Configuration

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 3. Database Setup

1. In your Supabase project dashboard, go to the SQL Editor
2. Execute the following SQL files in order:
   - `supabase/schema.sql` - Creates tables and functions
   - `supabase/rls-policies.sql` - Sets up security policies

## 4. Storage Setup

1. In Supabase dashboard, go to Storage
2. Create a new bucket called `article-images`
3. Set the bucket to public
4. Create another bucket called `avatars`
5. Set the avatars bucket to public

## 5. Edge Functions Setup

1. Install Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref YOUR_PROJECT_REF`
4. Deploy functions:
   ```bash
   supabase functions deploy vote
   supabase functions deploy articles  
   supabase functions deploy rankings
   ```

## 6. Authentication Setup

1. In Supabase dashboard, go to Authentication > Settings
2. Enable email authentication
3. Configure email templates as needed
4. Set site URL to your app's URL

## 7. Create First Admin User

1. Register a user through the app or Supabase dashboard
2. In the SQL Editor, run:
   ```sql
   UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

## 8. Test Your Setup

1. Start the Expo development server: `npm start`
2. Test user registration and login
3. Test article creation (as admin)
4. Test voting functionality

## 9. Production Considerations

- Set up proper email templates
- Configure SMTP settings for production emails
- Set up proper domain configuration
- Enable additional security features as needed
- Set up monitoring and logging

## Database Schema Overview

- **users**: User profiles with points and roles
- **articles**: News articles with voting options and odds
- **votes**: User votes (with unique constraint to prevent duplicates)
- **comments**: Threaded comments system
- **user_points**: Point transaction history

## Security Features

- Row-Level Security (RLS) enabled on all tables
- Users can only access their own data where appropriate
- Admin-only endpoints for article management
- Duplicate vote prevention
- HTTPS/TLS 1.3 enforcement