# Feature Testing Guide

## Testing Checklist

### 🔐 Authentication
- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens are properly stored
- [ ] Logout clears tokens

### 📝 Note Management
- [ ] Create new notes with title, content, and tags
- [ ] Edit existing notes
- [ ] Delete notes (only by owner)
- [ ] View note details
- [ ] Archive/unarchive notes

### 🔗 Sharing & Permissions
- [ ] Share note with read-only permission
- [ ] Share note with read-write permission
- [ ] Only note owner can manage sharing
- [ ] Shared users can view notes they have access to
- [ ] Shared users with write permission can edit notes
- [ ] Shared users without write permission cannot edit
- [ ] Remove users from sharing
- [ ] Users see "Shared" badge on notes they don't own

### 📊 Analytics Dashboard
- [ ] Dashboard loads without errors
- [ ] Most active users chart displays correctly
- [ ] Most used tags list shows properly
- [ ] Notes per day chart shows last 7 days
- [ ] Analytics data updates when new notes are created
- [ ] Dashboard is accessible only to authenticated users

### 🔍 Search & Pagination
- [ ] Search by title works
- [ ] Search by content works
- [ ] Search by tags works
- [ ] Search results show correct count
- [ ] Pagination works with large datasets
- [ ] Search and pagination work together
- [ ] Search is case-insensitive
- [ ] Empty search shows all notes

### 🎨 UI/UX Features
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly
- [ ] Responsive design works on different screen sizes
- [ ] Navigation between pages works smoothly
- [ ] Form validation works properly

## Test Scenarios

### Scenario 1: Basic Note Operations
1. Register a new user
2. Create a note with title, content, and tags
3. Edit the note
4. Delete the note
5. Verify note is removed

### Scenario 2: Sharing Workflow
1. Create a note as User A
2. Share note with User B (read-only)
3. Login as User B
4. Verify User B can see the note but cannot edit
5. Share note with User C (read-write)
6. Login as User C
7. Verify User C can edit the note
8. Login as User A
9. Remove User B from sharing
10. Verify User B can no longer access the note

### Scenario 3: Search and Pagination
1. Create multiple notes with different titles and tags
2. Test search by title
3. Test search by tag
4. Test search by content
5. Verify pagination works with many notes
6. Test search with pagination

### Scenario 4: Analytics
1. Create notes with different users
2. Add various tags to notes
3. Visit analytics dashboard
4. Verify all charts and lists display correctly
5. Create more notes and verify analytics update

## API Testing

### Test the following endpoints:

#### Authentication
```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Notes with Search & Pagination
```bash
# Get notes with search
curl -X GET "http://localhost:8000/notes?search=test&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create note
curl -X POST http://localhost:8000/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Note","content":"Test content","tags":["test","demo"]}'
```

#### Sharing
```bash
# Share note
curl -X PUT http://localhost:8000/notes/NOTE_ID/share \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"email":"user@example.com","permission":"read"}]'

# Get sharing info
curl -X GET http://localhost:8000/notes/NOTE_ID/share \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Analytics
```bash
# Get all analytics
curl -X GET http://localhost:8000/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Issues & Solutions

### Issue: Search not working
- Check if MongoDB regex search is properly configured
- Verify search query is being sent correctly

### Issue: Sharing permissions not working
- Check if user email is stored correctly in localStorage
- Verify sharing data structure matches expected format

### Issue: Analytics not loading
- Check if MongoDB aggregation pipelines are working
- Verify date formatting in analytics service

### Issue: Pagination not working
- Check if total count is being calculated correctly
- Verify page and limit parameters are being passed

## Performance Testing

- Test with 100+ notes to verify pagination performance
- Test search with large datasets
- Verify analytics queries are optimized
- Check memory usage with many concurrent users 