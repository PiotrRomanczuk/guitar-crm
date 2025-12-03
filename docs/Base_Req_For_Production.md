# Guitar CRM - Production Requirements

## Overview

The Guitar CRM is a comprehensive web application designed to help guitar teachers manage their students, lessons, songs, and assignments. The system supports multiple user roles (Admin, Teacher, Student) with role-based access control and automated workflows.

## Core Requirements

### 1. Admin Management Features

#### Song Management (CRUD Operations)

- **Create**: Admin can add new songs to the system with complete metadata
  - Song title, author/artist, difficulty level (beginner/intermediate/advanced)
  - Musical key, Ultimate Guitar link, chord progressions
  - Song categorization and tagging
- **Read**: Admin can view all songs with filtering and search capabilities
  - Browse by difficulty, key, author, or custom tags
  - View detailed song information and statistics
- **Update**: Admin can modify existing song information
  - Edit metadata, update links, change difficulty levels
  - Bulk update operations for multiple songs
- **Delete**: Admin can remove songs from the system
  - Soft delete with confirmation to prevent accidental data loss
  - Cascade handling for related lesson assignments

#### Lesson Management (CRUD Operations)

- **Create**: Admin can schedule and create lesson records
  - Assign lessons to specific teacher-student pairs
  - Set lesson dates, duration, and objectives
  - Auto-increment lesson numbers per teacher-student relationship
- **Read**: Admin can view all lessons across the system
  - Filter by teacher, student, date range, or status
  - View lesson progress and completion statistics
- **Update**: Admin can modify lesson details and assignments
  - Change dates, update objectives, reassign teachers/students
  - Update lesson status and completion notes
- **Delete**: Admin can cancel or remove lessons
  - Maintain audit trail for cancelled lessons

#### Assignment Management (CRUD Operations)

- **Create**: Admin can create assignments for students
  - Link assignments to specific lessons and songs
  - Set assignment types (practice, memorization, performance)
  - Define deadlines and completion criteria
- **Read**: Admin can track all assignments
  - Monitor completion status and progress
  - View assignment history and student performance
- **Update**: Admin can modify assignment requirements
  - Change deadlines, update instructions, adjust difficulty
- **Delete**: Admin can remove assignments when needed
  - Maintain records of completed assignments

#### User Management

- **Create Users**: Admin can create new user accounts
  - Set user roles (Admin, Teacher, Student) - roles are not mutually exclusive
  - Assign multiple roles to single users (e.g., Teacher + Student)
  - Set up user profiles with contact information
- **Manage User Roles**: Admin can modify user permissions
  - Add/remove roles without affecting other user data
  - Bulk role assignments for multiple users
- **User Lifecycle**: Handle user account management
  - Activate/deactivate accounts
  - Reset passwords and manage access

### 2. Automated Email System

#### Post-Lesson Notifications

- **Automatic Email Sending**: System automatically sends emails to students after each lesson
  - Triggered immediately after lesson completion
  - Contains lesson summary, next lesson details, and assignments
  - Includes progress updates and encouragement messages

#### Email Templates

- **Customizable Templates**: Admin can configure email templates
  - Different templates for different lesson types or student levels
  - Include dynamic content (student name, lesson details, assignments)
  - Support for HTML formatting and branding

#### Email Scheduling

- **Reminder System**: Automated reminder emails
  - Pre-lesson reminders (configurable timing)
  - Assignment deadline reminders
  - Practice session encouragement emails

### 3. Teacher Features

#### Student Management

- View assigned students and their progress
- Schedule lessons and manage lesson flow
- Track student advancement through difficulty levels

#### Lesson Planning

- Create lesson plans with song assignments
- Set learning objectives and track completion
- Monitor student practice and improvement

### 4. Student Features

#### Lesson Access

- View upcoming and past lessons
- Access assigned songs and practice materials
- Track personal progress and achievements

#### Practice Management

- View current assignments and deadlines
- Update practice status and notes
- Request help or additional resources

## Technical Requirements

### Security & Authentication

- Role-based access control (RBAC) with multiple concurrent roles
- Secure authentication using Supabase Auth
- Row Level Security (RLS) policies for data protection
- HTTPS encryption for all communications

### Performance

- Fast loading times (< 2 seconds for page loads)
- Mobile-responsive design (mobile-first approach)
- Offline capability for critical features

### Data Integrity

- Comprehensive data validation using Zod schemas
- Database constraints and foreign key relationships
- Audit trails for all critical operations
- Automated backups and data recovery

### User Experience

- Intuitive, clean interface using modern UI components
- Dark mode support throughout the application
- Accessibility compliance (WCAG 2.1 AA standards)
- Multi-device compatibility (desktop, tablet, mobile)

## Success Criteria

### Functional Completeness

- All CRUD operations working for songs, lessons, and assignments
- User creation and role management fully operational
- Automated email system sending notifications reliably
- All user roles can perform their designated functions

### Quality Assurance

- Comprehensive test coverage (70%+ code coverage)
- All critical user journeys tested end-to-end
- Performance benchmarks met consistently
- Security audit passed with no critical vulnerabilities

### User Adoption

- Intuitive interface requiring minimal training
- Mobile-friendly for on-the-go access
- Reliable email delivery (99.9% uptime)
- Fast response times for all operations

## Future Enhancements

### Advanced Features (Phase 2)

- Student progress analytics and reporting
- Integration with music learning platforms
- Video lesson recording and sharing
- Parent portal for progress tracking
- Automated practice reminder scheduling

### Scalability Improvements

- Multi-tenant architecture for multiple schools
- Advanced search and filtering capabilities
- Bulk operations for large datasets
- API integrations with external music services
