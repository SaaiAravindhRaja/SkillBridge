# SkillBridge - Educational Tutoring Platform

SkillBridge connects kids who need academic help with volunteer tutors in a safe, simple platform.

## Features

### For Students (Kids)
- **Simple Registration**: Register with name, school, grade, and optional parent contact
- **Request Help**: Submit help requests for specific subjects and topics
- **Dashboard**: View request status and session history
- **Safe Communication**: Text-based chat with volunteer tutors

### For Volunteers (Tutors)
- **Easy Signup**: Register with school/university, year, and subjects you can help with
- **Browse Requests**: See available help requests filtered by your expertise
- **Accept Sessions**: Choose students to help based on your availability
- **Track Impact**: View completed sessions and earn recognition

### Core Functionality
- **Google Authentication**: Simplified login process
- **Subject Areas**: Math, Science, English, History, Computer Science, and more
- **Session Types**: Homework help, concept understanding, test prep
- **Scheduling**: Flexible time slots from 3 PM to 8 PM
- **Feedback System**: Rate and review sessions for continuous improvement

## Tech Stack

- **Frontend**: React 18, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens with Google OAuth simulation
- **Styling**: Custom CSS with mobile-responsive design

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Set up environment variables**:
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your MongoDB URI and JWT secret
   ```

3. **Start the development servers**:
   ```bash
   npm run dev
   ```

   This runs both the React frontend (port 3000) and Node.js backend (port 5000) concurrently.

4. **Open your browser**:
   Navigate to `http://localhost:3000`

### Demo Mode

The app includes a demo authentication system for quick testing:
- No actual Google OAuth setup required
- Choose "Kid" or "Volunteer" during signup
- Fill in the required information
- Start using the platform immediately

## Project Structure

```
skillbridge-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth middleware
│   └── package.json
└── package.json           # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login/signup

### Help Requests
- `POST /api/requests` - Create help request (kids only)
- `GET /api/requests/available` - Get available requests (volunteers only)
- `POST /api/requests/:id/accept` - Accept help request (volunteers only)
- `GET /api/requests/my` - Get user's requests

### Sessions
- `POST /api/sessions` - Create session from accepted request
- `GET /api/sessions/my` - Get user's sessions
- `POST /api/sessions/:id/messages` - Add message to session
- `POST /api/sessions/:id/feedback` - Submit session feedback

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Safety Features

- **Minimal Personal Info**: Only essential information is collected
- **Admin Oversight**: All messages are visible to administrators
- **Masked Contacts**: Email/phone numbers are not shared directly
- **Age-Appropriate**: Designed specifically for educational purposes

## Development Roadmap

### Phase 1 (Current) - MVP
- ✅ User registration and authentication
- ✅ Help request system
- ✅ Volunteer matching
- ✅ Basic dashboard
- ✅ Request management

### Phase 2 - Enhanced Communication
- [ ] Real-time chat with Socket.io
- [ ] Image upload for homework photos
- [ ] Voice message support
- [ ] Session reminders

### Phase 3 - Advanced Features
- [ ] Video chat integration
- [ ] Calendar scheduling
- [ ] Badge and reward system
- [ ] Parent/teacher dashboard
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please open an issue on GitHub or contact the development team.

---

**SkillBridge** - Empowering students through peer-to-peer learning 🌉📚