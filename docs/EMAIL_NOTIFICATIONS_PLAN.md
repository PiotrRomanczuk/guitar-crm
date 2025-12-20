# Email Notifications Plan

## Overview
This document outlines the strategy for implementing email notifications in Guitar CRM. We will use **React Email** for templates and **Resend** (or Nodemailer for dev) for delivery.

## Implementation Priority

### 1. Admin Song Database Report (Immediate Priority)
A data quality report for the admin to track the completeness of the song database.

*   **Trigger**: On-demand (Admin Dashboard button) or Scheduled (Weekly Cron).
*   **Audience**: Admin / Teacher.
*   **Purpose**: Identify songs that need metadata updates (chords, links, videos).
*   **Content**:
    *   **Summary Stats**: Total songs, % with chords, % with video links.
    *   **Action Items**: List of songs missing specific fields:
        *   Missing Chords
        *   Missing YouTube Links
        *   Missing Ultimate Guitar Links
        *   Missing Gallery Images
    *   **Quick Links**: Direct links to edit these songs in the dashboard.

---

## Future Templates

### 2. Lesson Recap & Homework
*Enhancement of current implementation.*

*   **Trigger**: Teacher clicks "Send Summary" after a lesson.
*   **Purpose**: Consolidates practice materials for the student.
*   **Content**:
    *   Lesson Summary / Topic.
    *   List of songs practiced with specific teacher notes.
    *   Next lesson date/time.
    *   Encouragement.

### 3. Upcoming Lesson Reminder
*   **Trigger**: Automated job (24h before `scheduled_at`).
*   **Purpose**: Reduce no-shows and prepare students.
*   **Content**:
    *   Date & Time.
    *   Location / Zoom Link.
    *   Preparation checklist (tune guitar, review previous homework).
    *   Reschedule link.

### 4. Welcome / New Student Onboarding
*   **Trigger**: New student account creation.
*   **Purpose**: Professional welcome and system access.
*   **Content**:
    *   Welcome message from the teacher.
    *   Login credentials / Magic Link.
    *   Guide to the Student Dashboard.
