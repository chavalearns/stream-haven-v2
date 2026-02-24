# 🌙 Stream Haven V2

A complete streaming dashboard for content creators with local SQLite database and modern UI.

## ✨ Features

- 🎯 **Complete Dashboard** - Track streams, content, goals, ideas, and growth
- 🗄️ **Local SQLite Database** - No server costs, works offline
- 🔐 **Local Authentication** - Secure user accounts with auto-login
- 🎨 **8 Beautiful Themes** - Instant theme switching with persistence
- 📱 **Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- 🚀 **Zero Dependencies** - Self-contained, no external APIs needed
- 📊 **Growth Tracking** - Monitor your streaming progress over time
- 💡 **Idea Vault** - Store and organize content ideas
- 🎮 **Game Goals** - Track gaming achievements and goals
- 🔗 **Quick Links** - Save important streaming resources
- **Calendar**: Monthly view of scheduled events
- **Goals Tracker**: Set and track streaming goals with progress bars
- **Sims/Oldenburg Goals**: Game-specific goal tracking
- **Idea Vault**: Store and manage creative content ideas
- **Growth Tracker**: Monitor follower growth across platforms
- **Quick Links**: Save frequently used links
- **Theme Customizer**: 8 pastel themes with dark/light modes
- **Multi-Account Support**: Manage multiple streaming accounts
- **Settings**: Profile management, data export, and preferences

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth
- **Styling**: CSS Variables, Grid, Flexbox, Animations
- **Icons**: Unicode emojis and SVG

## Getting Started

### Prerequisites

- Node.js (for local development)
- Supabase account and project

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stream-haven-v2
   ```

2. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Run the contents of `database-schema.sql` in the Supabase SQL editor
   - Enable authentication in Supabase settings
   - Get your Supabase URL and anon key from Settings → API

3. **Configure the application**
   - Open `js/supabase-config.js`
   - Replace placeholder values with your Supabase credentials:
   ```javascript
   const SUPABASE_URL = 'https://your-project-id.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

4. **Run locally**
   ```bash
   # Using a simple HTTP server
   npx http-server .
   
   # Or using Python
   python -m http.server 8000
   ```

5. **Open the application**
   - Navigate to `http://localhost:8000` (or your chosen port)
   - Start by creating an account on the login page

## Database Schema

The application uses the following main tables:

- `profiles` - User profiles linked to Supabase auth
- `accounts` - Multi-account support for different streaming personas
- `streams` - Scheduled streaming sessions
- `content_planner` - Content creation pipeline
- `goals` - Streaming goals with progress tracking
- `sims_goals` - Game-specific goals
- `ideas` - Creative content idea vault
- `quick_links` - Frequently used links
- `growth_stats` - Follower growth statistics
- `user_settings` - Theme and preference settings

## Features Overview

### Authentication
- Email/password signup and login
- Automatic profile creation on signup
- Session management
- Secure logout

### Dashboard
- Dynamic welcome messages
- Next stream countdown
- Growth stats overview
- This week's activities
- Current goal progress
- Recent ideas display
- Quick action buttons
- Motivational quotes

### Stream Planning
- Add/edit/delete streams
- Platform selection (Twitch, YouTube, TikTok, Instagram)
- Date/time scheduling
- Completion tracking
- Sorted by date

### Content Planning
- Multiple content types (stream, video, short, post)
- Status tracking (idea → planning → recording → editing → published)
- Date scheduling
- Status updates

### Calendar
- Monthly view
- Color-coded events
- Today highlighting
- Navigation controls
- Event details on click

### Goals
- Target and current progress
- Visual progress bars
- Percentage completion
- Inline progress updates
- Completion badges

### Themes
- 8 pastel color themes: Lavender, Rose, Mint, Sky, Peach, Coral, Lemon, Aqua
- Dark and light modes
- Real-time theme switching
- Persistent settings

### Multi-Account Support
- Create multiple accounts
- Switch between accounts
- Isolated data per account
- Account management

## Security

- Row Level Security (RLS) on all tables
- User-specific data isolation
- Account-based data separation
- Secure authentication flow
- Input validation and sanitization

## Performance

- Efficient Supabase queries
- Minimal data loading
- Anti-flicker theme loading
- Optimized CSS animations
- Responsive design

## Browser Support

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the existing issues
- Create a new issue with detailed information
- Include browser and environment details

---

**Stream Haven V2** - Your complete streaming dashboard solution 🌙
