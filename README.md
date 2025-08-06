# News Voting App (ニュース投票アプリ)

A gamified mobile news voting app built with React Native and Supabase. Users can vote on news articles, earn points, and compete in rankings.

## Features

- **Article Voting**: Vote on news articles with 2-choice options
- **Point System**: Earn 1 point per vote
- **Real-time Odds**: Dynamic odds calculation based on voting ratios
- **User Rankings**: Leaderboard sorted by total points earned
- **User Profiles**: Customizable profiles with statistics
- **Admin Dashboard**: Create and manage articles (admin only)
- **Authentication**: Email/password authentication with Supabase Auth
- **Cross-platform**: iOS and Android support with single codebase

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **UI Components**: React Native Paper
- **Navigation**: React Navigation v6
- **TypeScript**: Full TypeScript support

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Supabase account
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Installation

1. **Clone the repository**
   ```bash
   cd news-tohyo-app
   npm install
   ```

2. **Set up Supabase**
   - Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Create your Supabase project and database
   - Deploy the Edge Functions
   - Configure environment variables

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## Project Structure

```
news-tohyo-app/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── lib/               # Utility functions and configurations
├── navigation/        # App navigation setup
├── screens/           # Screen components
├── supabase/          # Database schema and Edge Functions
│   ├── functions/     # Supabase Edge Functions
│   ├── schema.sql     # Database schema
│   └── rls-policies.sql # Row Level Security policies
├── App.tsx            # Root component
└── package.json       # Dependencies and scripts
```

## Key Features Implementation

### Authentication System
- Email/password registration and login
- Password reset functionality
- Session management with Supabase Auth
- User profile creation

### Voting System
- Duplicate vote prevention
- Real-time odds calculation using SQL triggers
- Point system with automatic user point updates
- Vote history tracking

### Admin Features
- Article creation and management
- Status control (draft/published)
- Article deletion
- Statistics dashboard

### Security
- Row-Level Security (RLS) policies
- User data isolation
- Admin-only endpoints
- HTTPS/TLS encryption

## Database Schema

The app uses the following main tables:
- `users`: User profiles and points
- `articles`: News articles with voting options
- `votes`: User votes (with unique constraints)
- `comments`: Comment system (future feature)
- `user_points`: Point transaction history

## API Endpoints

### Edge Functions
- `POST /functions/v1/vote`: Submit a vote
- `GET /functions/v1/articles`: Fetch articles with pagination
- `GET /functions/v1/rankings`: Get user rankings

## Development

### Running Tests
```bash
npm test
```

### Code Formatting
```bash
npm run format
```

### Type Checking
```bash
npm run type-check
```

### Building for Production
```bash
# iOS
expo build:ios

# Android
expo build:android
```

## Deployment

1. **Configure EAS Build**
   ```bash
   expo install --fix
   eas build:configure
   ```

2. **Build for App Stores**
   ```bash
   eas build --platform all
   ```

3. **Submit to App Stores**
   ```bash
   eas submit
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support, please open an issue in the GitHub repository.

## Specification Compliance

This implementation follows the original Japanese specification document:
- ✅ 2-choice voting system
- ✅ Point system (1pt per vote)
- ✅ Real-time odds calculation
- ✅ User rankings
- ✅ Admin dashboard
- ✅ Email/password authentication
- ✅ iOS/Android cross-platform support
- ✅ Row-Level Security
- ✅ Supabase backend integration

## Version History

- **v1.0.0**: Initial release with core voting functionality
  - Basic voting system
  - User authentication
  - Ranking system  
  - Admin dashboard