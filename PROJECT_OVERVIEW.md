# Guitar CRM - Students Manager 🎸

## Overview

Guitar CRM is a comprehensive student management system designed specifically for guitar teachers and music instructors. The application streamlines lesson management, student progress tracking, song assignments, and administrative tasks in a modern, user-friendly interface.

## 🎯 Purpose

This application serves as a complete solution for guitar teachers who need to:

- Manage student profiles and lesson schedules
- Track student progress with song assignments
- Organize song libraries with difficulty levels and musical keys
- Assign and monitor tasks for students
- Generate reports and analytics
- Handle administrative duties efficiently

## 🏗️ Technical Architecture

### **Frontend**

- **Framework**: Next.js 16.0.0 with React 19.2.0
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS 4.0 for modern UI design
- **State Management**: React hooks and server state

### **Backend & Database**

- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: Supabase Auth with role-based permissions
- **API**: RESTful APIs with Supabase client
- **Real-time**: Supabase real-time subscriptions

### **Validation & Type Safety**

- **Schema Validation**: Zod for runtime validation
- **Type Generation**: Automatic TypeScript types from database schema
- **Form Validation**: Comprehensive input validation with error handling

## 🧑‍🎓 User Roles & Permissions

### **Admin**

- Full system access and configuration
- User management (create, edit, delete users)
- Task management and assignment
- System-wide reporting and analytics
- Database administration

### **Teacher**

- Student profile management
- Lesson creation and scheduling
- Song assignment and progress tracking
- Individual student reports
- Task assignment to students

### **Student**

- View assigned lessons and songs
- Track personal progress
- Access learning materials
- View personal statistics
- Update profile information

## 📊 Core Entities

### **1. Profiles (Users)**

- **Purpose**: Manage all system users with role-based permissions
- **Fields**:
  - Basic info (name, email, contact details)
  - Role flags (isAdmin, isTeacher, isStudent)
  - Status flags (isActive, canEdit, isTest)
  - Timestamps (created_at, updated_at)

### **2. Songs**

- **Purpose**: Comprehensive song library management
- **Fields**:
  - Song details (title, author, key, level)
  - Learning resources (chords, audio files, Ultimate Guitar links)
  - Metadata (short_title, created_at, updated_at)
- **Features**:
  - Difficulty levels (beginner, intermediate, advanced)
  - Musical keys (C, C#, D, etc. including minors)
  - Search and filtering capabilities
  - Import/Export functionality

### **3. Lessons**

- **Purpose**: Lesson scheduling and management
- **Fields**:
  - Relationships (student_id, teacher_id, creator_user_id)
  - Scheduling (date, start_time, status)
  - Content (title, notes, lesson_number)
  - Auto-incrementing lesson numbers per student-teacher pair
- **Features**:
  - Status tracking (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, RESCHEDULED)
  - Teacher-wise lesson numbering
  - Profile integration for student/teacher details

### **4. Lesson Songs**

- **Purpose**: Track song assignments within lessons
- **Fields**:
  - Relationships (lesson_id, song_id, student_id)
  - Progress tracking (song_status)
  - Timestamps (created_at, updated_at)
- **Features**:
  - Learning status tracking (to_learn, started, remembered, with_author, mastered)
  - Student-specific progress monitoring

### **5. User Favorites**

- **Purpose**: Allow users to favorite songs for quick access
- **Fields**:
  - Relationships (user_id, song_id)
  - Timestamps (created_at)
- **Features**:
  - Personal song collections
  - Quick access to preferred songs

### **6. Task Management**

- **Purpose**: Administrative task tracking and assignment
- **Fields**:
  - Task details (title, description, category)
  - Priority levels (Critical, High, Medium, Low)
  - Status tracking (Not Started, In Progress, Completed, Blocked)
  - Assignment (assignee_id, created_by)
  - Scheduling (due_date, estimated_effort)
  - Additional info (tags, external_link, notes)
- **Features**:
  - Admin-only access for task management
  - Priority-based organization
  - Tag-based categorization
  - External link integration

## 🔒 Security Features

### **Row Level Security (RLS)**

- Profile access: Users can only view/edit their own profiles
- Admin privileges: Admins have full access to all entities
- Task management: Restricted to admin users only
- Data isolation: Proper user data segregation

### **Authentication & Authorization**

- Supabase Auth integration
- Role-based access control
- Secure API endpoints
- Protected routes and components

## 🎵 Key Features

### **For Teachers:**

1. **Student Management**

   - Add, edit, and manage student profiles
   - Track student progress across multiple songs
   - Generate individual student reports

2. **Lesson Planning**

   - Schedule lessons with automatic numbering
   - Assign songs to lessons with difficulty tracking
   - Add lesson notes and progress updates

3. **Song Library**

   - Comprehensive song database with search/filter
   - Categorize by difficulty level and musical key
   - Include learning resources (chords, audio, tabs)

4. **Progress Tracking**
   - Monitor student advancement through song difficulty levels
   - Track learning status for each assigned song
   - Visual progress indicators and statistics

### **For Students:**

1. **Personal Dashboard**

   - View upcoming lessons and assignments
   - Track personal progress and achievements
   - Access learning materials and resources

2. **Song Library Access**

   - Browse assigned songs and materials
   - Mark favorite songs for quick access
   - View learning resources and chord charts

3. **Progress Monitoring**
   - See current learning status for each song
   - Track improvement over time
   - Access performance statistics

### **For Admins:**

1. **System Management**

   - User account creation and management
   - System-wide task assignment and tracking
   - Database administration and maintenance

2. **Analytics & Reporting**
   - Generate system-wide reports
   - Monitor user activity and engagement
   - Track system performance metrics

## 🚀 Technology Benefits

### **Type Safety**

- Comprehensive Zod schemas for all entities
- Automatic TypeScript type generation from database
- Runtime validation with detailed error messages
- Form validation with user-friendly feedback

### **Real-time Capabilities**

- Live updates for lesson schedules
- Real-time progress tracking
- Instant notifications for changes
- Collaborative features for teacher-student interaction

### **Scalability**

- Modern React architecture with server-side rendering
- Efficient database queries with proper indexing
- Optimized performance with Next.js features
- Cloud-based infrastructure with Supabase

### **User Experience**

- Responsive design for all devices
- Dark/light mode support
- Intuitive navigation and user interface
- Accessibility features built-in

## 📱 Planned Features

### **Mobile Responsiveness**

- Fully responsive design for tablets and smartphones
- Touch-friendly interface for mobile users
- Offline capabilities for essential features

### **Advanced Analytics**

- Student progress analytics and visualizations
- Teaching effectiveness metrics
- Song popularity and difficulty analysis
- Custom reporting capabilities

### **Communication Features**

- In-app messaging between teachers and students
- Lesson reminders and notifications
- Progress update notifications
- Assignment deadline alerts

### **Content Management**

- Audio/video file upload and storage
- PDF sheet music and chord chart management
- Practice recording capabilities
- Resource sharing and collaboration

## 🎯 Target Users

### **Primary Users**

- **Guitar Teachers**: Individual instructors managing multiple students
- **Music Schools**: Institutions with multiple teachers and students
- **Music Therapists**: Professionals tracking patient progress

### **Secondary Users**

- **Students**: Learners accessing their assigned materials and progress
- **Parents**: Monitoring children's musical education progress
- **Administrators**: Managing music education programs

## 📈 Success Metrics

### **User Engagement**

- Daily/weekly active users
- Lesson completion rates
- Song assignment completion rates
- User retention and satisfaction

### **Educational Outcomes**

- Student progress tracking accuracy
- Learning milestone achievements
- Time-to-competency metrics
- Skills development tracking

### **System Performance**

- Application response times
- Database query optimization
- Error rates and system reliability
- User experience satisfaction scores

---

_This application represents a modern, comprehensive solution for guitar education management, combining the best practices in web development with specialized features for music instruction._
