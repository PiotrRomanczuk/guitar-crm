--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6 (Ubuntu 17.6-1build1)

SET session_replication_role = 'replica';

-- Truncate tables to prevent conflicts with migration data
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.songs CASCADE;
TRUNCATE TABLE public.lessons CASCADE;
TRUNCATE TABLE public.lesson_songs CASCADE;
TRUNCATE TABLE public.assignments CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;
TRUNCATE TABLE public.user_integrations CASCADE;
TRUNCATE TABLE public.api_keys CASCADE;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) VALUES ('00000000-0000-0000-0000-000000000000', '8fb00f8b-01b5-44e6-8383-92907567995b', 'authenticated', 'authenticated', 'teststudent2@example.com', '$2a$10$OZCZ8R.imEkjskWnm8JU../i2GIBB02af8YVcnhVRtlnKoS93LA5O', '2025-11-25 09:42:50.730163+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-25 09:50:53.066256+00', '{"provider": "email", "providers": ["email"]}', '{"notes": "Sample active student", "lastName": "Student 2", "firstName": "Test", "isDevelopment": true, "email_verified": true}', NULL, '2025-11-25 09:42:50.725024+00', '2025-11-25 09:50:53.069112+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) VALUES ('00000000-0000-0000-0000-000000000000', '50476908-0736-44b9-9093-eb0620bc4c91', 'authenticated', 'authenticated', 'teststudent3@example.com', '$2a$10$x7oG9awyOws4tuviPpk9RuVCwSLliGFPfNDOL6InKz6Yy28TcrgWG', '2025-11-25 09:42:50.858047+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-25 09:50:53.293105+00', '{"provider": "email", "providers": ["email"]}', '{"notes": "Sample active student", "lastName": "Student 3", "firstName": "Test", "isDevelopment": true, "email_verified": true}', NULL, '2025-11-25 09:42:50.853342+00', '2025-11-25 09:50:53.295784+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) VALUES ('00000000-0000-0000-0000-000000000000', 'e8cfbe9a-b9ab-4530-a588-3efa26d1f849', 'authenticated', 'authenticated', 'teacher@example.com', '$2a$10$5YVrYbz1zfWNwG4KEbx/NufbcM2QrZpiwe4QEkhZwH2/N5xgAtCmK', '2025-11-25 09:42:50.306625+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-25 10:51:59.320717+00', '{"provider": "email", "providers": ["email"]}', '{"notes": "For testing teacher functionality", "lastName": "Teacher", "firstName": "Test", "isDevelopment": true, "email_verified": true}', NULL, '2025-11-25 09:42:50.301244+00', '2025-11-25 10:51:59.32377+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) VALUES ('00000000-0000-0000-0000-000000000000', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', 'authenticated', 'authenticated', 'student@example.com', '$2a$10$qU10uOW0CJ9fIn47PpRpHeM64mXjt8ZPe91OYfYxH1aS9sADzbUK2', '2025-11-25 09:42:50.440849+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-25 10:51:59.454404+00', '{"provider": "email", "providers": ["email"]}', '{"notes": "For testing student views", "lastName": "Student", "firstName": "Test", "isDevelopment": true, "email_verified": true}', NULL, '2025-11-25 09:42:50.433141+00', '2025-11-25 10:51:59.457088+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) VALUES ('00000000-0000-0000-0000-000000000000', '80aca30c-5fec-41dd-9eab-3410227c87ab', 'authenticated', 'authenticated', 'teststudent1@example.com', '$2a$10$Q/O3V2pF6K9GDMDG.TSwduCCMGkaB2R5b8G.jnLqXPVLOZ11cnkxi', '2025-11-25 09:42:50.593352+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-25 10:51:59.581535+00', '{"provider": "email", "providers": ["email"]}', '{"notes": "Sample active student", "lastName": "Student 1", "firstName": "Test", "isDevelopment": true, "email_verified": true}', NULL, '2025-11-25 09:42:50.586844+00', '2025-11-25 10:51:59.584426+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) VALUES ('00000000-0000-0000-0000-000000000000', 'db44f596-8ccb-4d71-837d-61de0fc791f7', 'authenticated', 'authenticated', 'p.romanczuk@gmail.com', '$2a$10$vH2ouxZj6.MCbWg59WRQEu18QQlokQND3iC/Ivvf33arW2h1T6gnm', '2025-11-25 09:42:49.552387+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-25 10:51:59.714219+00', '{"provider": "email", "providers": ["email"]}', '{"notes": "Has full system access", "lastName": "User", "firstName": "Admin", "isDevelopment": true, "email_verified": true}', NULL, '2025-11-25 09:42:49.545564+00', '2025-11-25 10:51:59.716901+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.profiles (id, email, full_name, avatar_url, notes, created_at, updated_at, is_development, is_admin, is_teacher, is_student) VALUES ('db44f596-8ccb-4d71-837d-61de0fc791f7', 'p.romanczuk@gmail.com', 'Admin User', NULL, 'Has full system access', '2025-11-25 09:57:50.997499+00', '2025-11-25 09:57:50.997499+00', true, true, true, false);
INSERT INTO public.profiles (id, email, full_name, avatar_url, notes, created_at, updated_at, is_development, is_admin, is_teacher, is_student) VALUES ('e8cfbe9a-b9ab-4530-a588-3efa26d1f849', 'teacher@example.com', 'Test Teacher', NULL, 'For testing teacher functionality', '2025-11-25 09:57:51.113617+00', '2025-11-25 09:57:51.113617+00', true, false, true, false);
INSERT INTO public.profiles (id, email, full_name, avatar_url, notes, created_at, updated_at, is_development, is_admin, is_teacher, is_student) VALUES ('1e0bebd7-4a17-43c7-a6d6-2ffeca285420', 'student@example.com', 'Test Student', NULL, 'For testing student views', '2025-11-25 09:57:51.232147+00', '2025-11-25 09:57:51.232147+00', true, false, false, true);
INSERT INTO public.profiles (id, email, full_name, avatar_url, notes, created_at, updated_at, is_development, is_admin, is_teacher, is_student) VALUES ('80aca30c-5fec-41dd-9eab-3410227c87ab', 'teststudent1@example.com', 'Test Student 1', NULL, 'Sample active student', '2025-11-25 09:57:51.330421+00', '2025-11-25 09:57:51.330421+00', true, false, false, true);
INSERT INTO public.profiles (id, email, full_name, avatar_url, notes, created_at, updated_at, is_development, is_admin, is_teacher, is_student) VALUES ('8fb00f8b-01b5-44e6-8383-92907567995b', 'teststudent2@example.com', 'Test Student 2', NULL, 'Sample active student', '2025-11-25 09:57:51.414453+00', '2025-11-25 09:57:51.414453+00', true, false, false, true);
INSERT INTO public.profiles (id, email, full_name, avatar_url, notes, created_at, updated_at, is_development, is_admin, is_teacher, is_student) VALUES ('50476908-0736-44b9-9093-eb0620bc4c91', 'teststudent3@example.com', 'Test Student 3', NULL, 'Sample active student', '2025-11-25 09:57:51.496001+00', '2025-11-25 09:57:51.496001+00', true, false, false, true);


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.lessons (id, teacher_id, student_id, lesson_teacher_number, scheduled_at, status, notes, created_at, updated_at) VALUES ('335380e7-24c2-4ddd-a2b3-35d6e542b240', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', 1, '2025-11-25 10:47:52.011+00', 'SCHEDULED', 'Bring your guitar!', '2025-11-25 10:34:41.813259+00', '2025-11-25 10:47:52.029465+00');
INSERT INTO public.lessons (id, teacher_id, student_id, lesson_teacher_number, scheduled_at, status, notes, created_at, updated_at) VALUES ('fc7fffc2-639a-4f1d-816d-50b44f4ac921', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', 2, '2025-11-24 10:47:52.011+00', 'COMPLETED', 'Practice G and C chords', '2025-11-25 10:34:41.813259+00', '2025-11-25 10:47:52.029465+00');
INSERT INTO public.lessons (id, teacher_id, student_id, lesson_teacher_number, scheduled_at, status, notes, created_at, updated_at) VALUES ('ad9aff59-9dea-44db-a663-dffe42405365', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', 3, '2025-11-26 10:47:52.011+00', 'SCHEDULED', 'Review scales', '2025-11-25 10:40:57.354718+00', '2025-11-25 10:47:52.029465+00');
INSERT INTO public.lessons (id, teacher_id, student_id, lesson_teacher_number, scheduled_at, status, notes, created_at, updated_at) VALUES ('8bceadea-1f5c-436b-8438-54b2b9cc7a4b', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', 4, '2025-12-02 10:47:52.011+00', 'SCHEDULED', 'Song practice', '2025-11-25 10:40:57.354718+00', '2025-11-25 10:47:52.029465+00');
INSERT INTO public.lessons (id, teacher_id, student_id, lesson_teacher_number, scheduled_at, status, notes, created_at, updated_at) VALUES ('f6139d60-541f-41f5-8214-50501bf4cd3c', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', 5, '2025-11-18 10:47:52.011+00', 'COMPLETED', 'Intro to fingerstyle', '2025-11-25 10:40:57.354718+00', '2025-11-25 10:47:52.029465+00');


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.assignments (id, title, description, status, due_date, created_at, updated_at, teacher_id, student_id, lesson_id) VALUES ('cdf36270-9e81-4b7b-8459-04a6e39173ae', 'Practice Scales', 'Major scale up and down', 'in_progress', '2025-12-02 10:34:41.912+00', '2025-11-25 10:34:41.925392+00', '2025-11-25 10:34:41.925392+00', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', NULL);
INSERT INTO public.assignments (id, title, description, status, due_date, created_at, updated_at, teacher_id, student_id, lesson_id) VALUES ('41ba0dde-ca6f-4d51-8004-338b8ca34f18', 'Practice Scales', 'Major scale up and down', 'in_progress', '2025-12-02 10:41:48.273+00', '2025-11-25 10:41:48.287798+00', '2025-11-25 10:41:48.287798+00', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', NULL);
INSERT INTO public.assignments (id, title, description, status, due_date, created_at, updated_at, teacher_id, student_id, lesson_id) VALUES ('61169695-2227-47d2-936c-0249b2a9ba8d', 'Learn Chords', 'G, C, D chords', 'completed', '2025-11-28 10:41:48.273+00', '2025-11-25 10:41:48.287798+00', '2025-11-25 10:41:48.287798+00', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', NULL);
INSERT INTO public.assignments (id, title, description, status, due_date, created_at, updated_at, teacher_id, student_id, lesson_id) VALUES ('33efb8de-183c-4998-a2b6-34c860c06c0b', 'Strumming Pattern 1', 'Down, Down, Up, Up, Down, Up', 'not_started', '2025-11-30 10:41:48.273+00', '2025-11-25 10:41:48.287798+00', '2025-11-25 10:41:48.287798+00', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', NULL);
INSERT INTO public.assignments (id, title, description, status, due_date, created_at, updated_at, teacher_id, student_id, lesson_id) VALUES ('d44d78a2-9660-4b47-bfa5-eb6505a90f07', 'Practice Scales', 'Major scale up and down', 'in_progress', '2025-12-02 10:45:13.816+00', '2025-11-25 10:45:13.818645+00', '2025-11-25 10:45:13.818645+00', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', NULL);
INSERT INTO public.assignments (id, title, description, status, due_date, created_at, updated_at, teacher_id, student_id, lesson_id) VALUES ('4c151b68-e130-47e7-9702-512130e18de8', 'Learn Chords', 'G, C, D chords', 'completed', '2025-11-28 10:45:13.816+00', '2025-11-25 10:45:13.818645+00', '2025-11-25 10:45:13.818645+00', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', NULL);
INSERT INTO public.assignments (id, title, description, status, due_date, created_at, updated_at, teacher_id, student_id, lesson_id) VALUES ('1e838ba6-f3ef-4667-a54a-349b4b86a6de', 'Strumming Pattern 1', 'Down, Down, Up, Up, Down, Up', 'not_started', '2025-11-30 10:45:13.816+00', '2025-11-25 10:45:13.818645+00', '2025-11-25 10:45:13.818645+00', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', NULL);
INSERT INTO public.assignments (id, title, description, status, due_date, created_at, updated_at, teacher_id, student_id, lesson_id) VALUES ('387920f7-4656-4f69-91d7-9b3e8da035a4', 'Practice Scales', 'Major scale up and down', 'in_progress', '2025-12-02 10:47:16.64+00', '2025-11-25 10:47:16.642668+00', '2025-11-25 10:47:16.642668+00', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', NULL);
INSERT INTO public.assignments (id, title, description, status, due_date, created_at, updated_at, teacher_id, student_id, lesson_id) VALUES ('213e5785-631d-4270-9eb8-6682a9ae5c44', 'Learn Chords', 'G, C, D chords', 'completed', '2025-11-28 10:47:16.64+00', '2025-11-25 10:47:16.642668+00', '2025-11-25 10:47:16.642668+00', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', NULL);
INSERT INTO public.assignments (id, title, description, status, due_date, created_at, updated_at, teacher_id, student_id, lesson_id) VALUES ('51e595b1-060a-45de-9b01-6a3e72a96a9d', 'Strumming Pattern 1', 'Down, Down, Up, Up, Down, Up', 'not_started', '2025-11-30 10:47:16.64+00', '2025-11-25 10:47:16.642668+00', '2025-11-25 10:47:16.642668+00', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', NULL);
INSERT INTO public.assignments (id, title, description, status, due_date, created_at, updated_at, teacher_id, student_id, lesson_id) VALUES ('8f85783f-8e49-496e-9a98-d7f0b098db44', 'Practice Scales', 'Major scale up and down', 'in_progress', '2025-12-02 10:47:52.079+00', '2025-11-25 10:47:52.081657+00', '2025-11-25 10:47:52.081657+00', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', NULL);
INSERT INTO public.assignments (id, title, description, status, due_date, created_at, updated_at, teacher_id, student_id, lesson_id) VALUES ('a4f42aa0-e083-4c4f-ad2a-7bb104e6d049', 'Learn Chords', 'G, C, D chords', 'completed', '2025-11-28 10:47:52.08+00', '2025-11-25 10:47:52.081657+00', '2025-11-25 10:47:52.081657+00', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', NULL);
INSERT INTO public.assignments (id, title, description, status, due_date, created_at, updated_at, teacher_id, student_id, lesson_id) VALUES ('43f650ac-9f68-4df9-a03e-3435641a3fd6', 'Strumming Pattern 1', 'Down, Down, Up, Up, Down, Up', 'not_started', '2025-11-30 10:47:52.08+00', '2025-11-25 10:47:52.081657+00', '2025-11-25 10:47:52.081657+00', 'db44f596-8ccb-4d71-837d-61de0fc791f7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', NULL);


--
-- Data for Name: songs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('a1111111-1111-1111-1111-111111111111', 'Wonderwall', 'Oasis', 'beginner', 'Em', 'https://www.ultimate-guitar.com/pro?song_id=1', 'Em7 Dsus2 A7sus4', '2025-11-25 08:44:30.196896+00', '2025-11-25 08:44:30.196896+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('a2222222-2222-2222-2222-222222222222', 'Knockin on Heaven''s Door', 'Bob Dylan', 'beginner', 'G', 'https://www.ultimate-guitar.com/pro?song_id=2', 'G D Am7 D', '2025-11-25 08:44:30.196896+00', '2025-11-25 08:44:30.196896+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('a3333333-3333-3333-3333-333333333333', 'House of the Rising Sun', 'The Animals', 'beginner', 'Am', 'https://www.ultimate-guitar.com/pro?song_id=3', 'Am C D F', '2025-11-25 08:44:30.196896+00', '2025-11-25 08:44:30.196896+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('b1111111-1111-1111-1111-111111111111', 'Stairway to Heaven', 'Led Zeppelin', 'intermediate', 'Am', 'https://www.ultimate-guitar.com/pro?song_id=4', 'Am Asus2 Dsus2', '2025-11-25 08:44:30.196896+00', '2025-11-25 08:44:30.196896+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('b2222222-2222-2222-2222-222222222222', 'Comfortably Numb', 'Pink Floyd', 'intermediate', 'B', 'https://www.ultimate-guitar.com/pro?song_id=5', 'B F# B F#', '2025-11-25 08:44:30.196896+00', '2025-11-25 08:44:30.196896+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('b3333333-3333-3333-3333-333333333333', 'Hotel California', 'Eagles', 'intermediate', 'Bm', 'https://www.ultimate-guitar.com/pro?song_id=6', 'Bm F# Bm F#', '2025-11-25 08:44:30.196896+00', '2025-11-25 08:44:30.196896+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('b4444444-4444-4444-4444-444444444444', 'Layla', 'Eric Clapton', 'intermediate', 'Dm', 'https://www.ultimate-guitar.com/pro?song_id=9', 'Dm Bb F', '2025-11-25 08:44:30.196896+00', '2025-11-25 08:44:30.196896+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('c1111111-1111-1111-1111-111111111111', 'One', 'Metallica', 'advanced', 'Em', 'https://www.ultimate-guitar.com/pro?song_id=7', 'Em F# G A', '2025-11-25 08:44:30.196896+00', '2025-11-25 08:44:30.196896+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('c2222222-2222-2222-2222-222222222222', 'Eruption', 'Van Halen', 'advanced', 'F#m', 'https://www.ultimate-guitar.com/pro?song_id=8', 'F#m', '2025-11-25 08:44:30.196896+00', '2025-11-25 08:44:30.196896+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('c3333333-3333-3333-3333-333333333333', 'All of Me', 'John Legend', 'intermediate', 'A', 'https://www.ultimate-guitar.com/pro?song_id=10', 'A Dm E', '2025-11-25 08:44:30.196896+00', '2025-11-25 08:44:30.196896+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('0e9613a9-9787-44d3-a838-e21082efaf2c', 'Sweet Child O Mine', 'Guns N Roses', 'intermediate', 'D', 'https://tabs.ultimate-guitar.com/tab/guns-n-roses/sweet-child-o-mine-tabs-1756', NULL, '2025-11-25 10:34:41.772406+00', '2025-11-25 10:34:41.772406+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('13049219-bf20-471d-8910-baf52085fe15', 'Nothing Else Matters', 'Metallica', 'intermediate', 'Em', 'https://tabs.ultimate-guitar.com/tab/metallica/nothing-else-matters-tabs-8519', NULL, '2025-11-25 10:34:41.772406+00', '2025-11-25 10:34:41.772406+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('1dd2b617-70dd-40be-8fa7-09201090c06d', 'Wish You Were Here', 'Pink Floyd', 'beginner', 'G', 'https://tabs.ultimate-guitar.com/tab/pink-floyd/wish-you-were-here-chords-44555', NULL, '2025-11-25 10:34:41.772406+00', '2025-11-25 10:34:41.772406+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('fb1ab1d5-4676-4096-a2c6-1e51b861e8d5', 'Blackbird', 'The Beatles', 'intermediate', 'G', 'https://tabs.ultimate-guitar.com/tab/the-beatles/blackbird-tabs-19486', NULL, '2025-11-25 10:34:41.772406+00', '2025-11-25 10:34:41.772406+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('3d731b12-2483-4ea9-a19f-950eba422ad3', 'Smells Like Teen Spirit', 'Nirvana', 'beginner', 'F', 'https://tabs.ultimate-guitar.com/tab/nirvana/smells-like-teen-spirit-tabs-202727', NULL, '2025-11-25 10:34:41.772406+00', '2025-11-25 10:34:41.772406+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('165ef961-8396-4f50-a130-add19d8b5685', 'Californication', 'Red Hot Chili Peppers', 'intermediate', 'Am', 'https://tabs.ultimate-guitar.com/tab/red-hot-chili-peppers/californication-tabs-57896', NULL, '2025-11-25 10:34:41.772406+00', '2025-11-25 10:34:41.772406+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('c3341c45-7f03-45e7-9227-31664084e1ca', 'Imagine', 'John Lennon', 'beginner', 'C', 'https://tabs.ultimate-guitar.com/tab/john-lennon/imagine-chords-9306', NULL, '2025-11-25 10:34:41.772406+00', '2025-11-25 10:34:41.772406+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('913a11eb-ac68-482b-b459-fe0c80128bee', 'Hallelujah', 'Jeff Buckley', 'intermediate', 'C', 'https://tabs.ultimate-guitar.com/tab/jeff-buckley/hallelujah-chords-198052', NULL, '2025-11-25 10:34:41.772406+00', '2025-11-25 10:34:41.772406+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('71515f32-9aad-403e-bb4e-a256ddbbca76', 'Let It Be', 'The Beatles', 'beginner', 'C', 'https://tabs.ultimate-guitar.com/tab/the-beatles/let-it-be-chords-17427', NULL, '2025-11-25 10:34:41.772406+00', '2025-11-25 10:34:41.772406+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('a4c8b4be-0ee5-4a17-af75-2bda44378066', 'Purple Haze', 'Jimi Hendrix', 'advanced', 'E', 'https://tabs.ultimate-guitar.com/tab/jimi-hendrix/purple-haze-tabs-168678', NULL, '2025-11-25 10:40:57.309299+00', '2025-11-25 10:40:57.309299+00', NULL, NULL);
INSERT INTO public.songs (id, title, author, level, key, ultimate_guitar_link, chords, created_at, updated_at, deleted_at, short_title) VALUES ('2a78f515-7eaa-4a51-899b-4863a7cb5cf9', 'Under the Bridge', 'Red Hot Chili Peppers', 'intermediate', 'E', 'https://tabs.ultimate-guitar.com/tab/red-hot-chili-peppers/under-the-bridge-chords-7034', NULL, '2025-11-25 10:40:57.309299+00', '2025-11-25 10:40:57.309299+00', NULL, NULL);


--
-- Data for Name: lesson_songs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.lesson_songs (id, lesson_id, song_id, status, notes, created_at, updated_at) VALUES ('267db1c7-4831-4358-93e7-5d6dfc24e26a', '335380e7-24c2-4ddd-a2b3-35d6e542b240', 'a1111111-1111-1111-1111-111111111111', 'to_learn', NULL, '2025-11-25 10:45:13.797815+00', '2025-11-25 10:45:13.797815+00');
INSERT INTO public.lesson_songs (id, lesson_id, song_id, status, notes, created_at, updated_at) VALUES ('63067027-d0e5-4ad0-a287-b6a1427aeaab', 'fc7fffc2-639a-4f1d-816d-50b44f4ac921', 'a2222222-2222-2222-2222-222222222222', 'to_learn', NULL, '2025-11-25 10:45:13.797815+00', '2025-11-25 10:45:13.797815+00');
INSERT INTO public.lesson_songs (id, lesson_id, song_id, status, notes, created_at, updated_at) VALUES ('1724fc7e-b183-4572-b5a6-c584cd3fac97', 'fc7fffc2-639a-4f1d-816d-50b44f4ac921', 'a3333333-3333-3333-3333-333333333333', 'to_learn', NULL, '2025-11-25 10:45:13.797815+00', '2025-11-25 10:45:13.797815+00');
INSERT INTO public.lesson_songs (id, lesson_id, song_id, status, notes, created_at, updated_at) VALUES ('8755425c-3f11-4d76-a972-d85a03da34b2', '335380e7-24c2-4ddd-a2b3-35d6e542b240', 'a2222222-2222-2222-2222-222222222222', 'to_learn', NULL, '2025-11-25 10:47:52.063104+00', '2025-11-25 10:47:52.063104+00');
INSERT INTO public.lesson_songs (id, lesson_id, song_id, status, notes, created_at, updated_at) VALUES ('5cffffe5-f3a5-43c5-93c6-99d11c5f504b', 'ad9aff59-9dea-44db-a663-dffe42405365', 'b1111111-1111-1111-1111-111111111111', 'to_learn', NULL, '2025-11-25 10:47:52.063104+00', '2025-11-25 10:47:52.063104+00');


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_roles (id, user_id, role, assigned_at) VALUES ('7b6ed07c-9e74-4956-88c0-e5db46b50218', 'db44f596-8ccb-4d71-837d-61de0fc791f7', 'admin', '2025-11-25 10:51:08.36785+00');
INSERT INTO public.user_roles (id, user_id, role, assigned_at) VALUES ('3ca3f0aa-05e0-4b3a-ad94-4d416211f217', 'db44f596-8ccb-4d71-837d-61de0fc791f7', 'teacher', '2025-11-25 10:51:08.403961+00');
INSERT INTO public.user_roles (id, user_id, role, assigned_at) VALUES ('04ba1a34-d5e8-4732-b95d-b8a98f49da7f', 'e8cfbe9a-b9ab-4530-a588-3efa26d1f849', 'teacher', '2025-11-25 10:51:08.428192+00');
INSERT INTO public.user_roles (id, user_id, role, assigned_at) VALUES ('43abc1ee-d569-4467-9c89-a04b9217ced7', '1e0bebd7-4a17-43c7-a6d6-2ffeca285420', 'student', '2025-11-25 10:51:08.455563+00');
INSERT INTO public.user_roles (id, user_id, role, assigned_at) VALUES ('4c651e10-0d00-4837-a7d3-61038668bc30', '80aca30c-5fec-41dd-9eab-3410227c87ab', 'student', '2025-11-25 10:51:08.468386+00');
INSERT INTO public.user_roles (id, user_id, role, assigned_at) VALUES ('ee826216-beaf-47ea-99b6-997f58b700a2', '8fb00f8b-01b5-44e6-8383-92907567995b', 'student', '2025-11-25 10:51:08.47552+00');
INSERT INTO public.user_roles (id, user_id, role, assigned_at) VALUES ('529ffa96-7346-4124-86f5-f2d05666a388', '50476908-0736-44b9-9093-eb0620bc4c91', 'student', '2025-11-25 10:51:08.483927+00');


--
-- PostgreSQL database dump complete
--

--
-- Data for Name: user_integrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Google Calendar integration for admin/teacher
INSERT INTO public.user_integrations (user_id, provider, access_token, refresh_token, expires_at, created_at, updated_at) VALUES 
('db44f596-8ccb-4d71-837d-61de0fc791f7', 'google_calendar', 'ya29.test_access_token_admin', 'test_refresh_token_admin', EXTRACT(EPOCH FROM (NOW() + INTERVAL '3600 seconds'))::bigint, NOW(), NOW()),
('e8cfbe9a-b9ab-4530-a588-3efa26d1f849', 'google_calendar', 'ya29.test_access_token_teacher', 'test_refresh_token_teacher', EXTRACT(EPOCH FROM (NOW() + INTERVAL '3600 seconds'))::bigint, NOW(), NOW());

--
-- Note: api_keys table seeding skipped
-- Reason: pgcrypto extension functions (gen_salt, crypt) are not available during seed execution
-- Solution: API keys should be created through the application interface or via separate migration
--

SET session_replication_role = 'origin';
