# Note Management System

A full-stack note management application with sharing capabilities, analytics dashboard, and advanced search features.

## Features

### 🔐 Authentication & User Management
- User registration and login
- JWT token-based authentication
- Secure password handling

### 📝 Note Management
- Create, edit, and delete notes
- Rich text content with tags
- Archive/unarchive notes
- Real-time updates

### 🔗 Sharing & Permissions
- **Read-only sharing**: Share notes with users who can only view
- **Read-write sharing**: Share notes with users who can edit
- **Owner controls**: Only note owners can manage sharing settings
- **Permission-based access**: Users see only notes they own or that are shared with them
- **Share management interface**: Easy-to-use UI for managing note sharing

### 📊 Analytics Dashboard
- **Most active users**: Shows top users by note count
- **Most used tags**: Displays popular tags across all notes
- **Notes created per day**: 7-day chart showing note creation trends
- **Real-time data**: Analytics update automatically

### 🔍 Search & Pagination
- **Advanced search**: Search by title, content, or tags
- **Pagination**: Navigate through large note collections
- **Real-time search**: Instant results as you type
- **Search results count**: Shows total number of matching notes

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL database for flexible data storage
- **JWT**: Secure authentication tokens
- **Pydantic**: Data validation and serialization

### Frontend
- **React**: Modern UI library
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Chart.js**: Interactive charts for analytics
- **Axios**: HTTP client for API communication

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Notes
- `GET /notes` - Get user's notes (with search & pagination)
- `POST /notes` - Create new note
- `GET /notes/{id}` - Get specific note
- `PUT /notes/{id}` - Update note
- `DELETE /notes/{id}` - Delete note

### Sharing
- `GET /notes/{id}/share` - Get sharing settings
- `PUT /notes/{id}/share` - Update sharing settings

### Analytics
- `GET /analytics` - Get all analytics data
- `GET /analytics/tags` - Get most used tags
- `GET /analytics/notes-daily` - Get notes per day
- `GET /analytics/active-users` - Get most active users

### Public Access
- `GET /public/notes/{id}` - Public note view

## Installation & Setup

### Backend Setup
```bash
cd note-backend
pip install -r requirements.txt
# Set up MongoDB connection
python -m uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd note-frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
```

## Timezone Configuration

The application is configured to use **Asia/Kolkata** timezone for all timestamps:
- Note creation and update times
- Analytics data
- All displayed timestamps in the frontend

This ensures consistent time display across the application.

## Usage

1. **Register/Login**: Create an account or sign in
2. **Create Notes**: Add new notes with titles, content, and tags
3. **Share Notes**: Use the share button to give access to other users
4. **Search & Browse**: Use the search bar and pagination to find notes
5. **View Analytics**: Check the dashboard for insights about your notes
6. **Manage Permissions**: Control who can view or edit your shared notes

## Security Features

- JWT token authentication
- Password hashing
- Permission-based access control
- Input validation and sanitization
- CORS configuration for secure cross-origin requests

## Performance Features

- Pagination for large datasets
- Efficient search with regex patterns
- Optimized database queries
- Real-time updates
- Responsive UI design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License. 