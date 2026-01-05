-- Migration: Seed initial data for development/testing
-- NOTE: This uses the new assignments table structure (not the old task_management)

-- Seed profiles first (required for foreign keys)
INSERT INTO profiles (id, email, full_name, is_admin, is_teacher, is_student) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@guitcrm.test', 'Admin User', true, false, false),
('22222222-2222-2222-2222-222222222222', 'teacher1@guitcrm.test', 'Teacher One', false, true, false),
('33333333-3333-3333-3333-333333333333', 'teacher2@guitcrm.test', 'Teacher Two', false, true, false),
('44444444-4444-4444-4444-444444444444', 'student1@guitcrm.test', 'Student One', false, false, true),
('55555555-5555-5555-5555-555555555555', 'student2@guitcrm.test', 'Student Two', false, false, true),
('66666666-6666-6666-6666-666666666666', 'student3@guitcrm.test', 'Student Three', false, false, true),
('77777777-7777-7777-7777-777777777777', 'teacher_student@guitcrm.test', 'Teacher Student', false, true, true)
ON CONFLICT (id) DO NOTHING;

-- Seed songs
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES
('a1111111-1111-1111-1111-111111111111', 'Wonderwall', 'Oasis', 'beginner', 'Em', 'https://www.ultimate-guitar.com/pro?song_id=1', 'Em7 Dsus2 A7sus4'),
('a2222222-2222-2222-2222-222222222222', 'Knockin on Heaven''s Door', 'Bob Dylan', 'beginner', 'G', 'https://www.ultimate-guitar.com/pro?song_id=2', 'G D Am7 D'),
('a3333333-3333-3333-3333-333333333333', 'House of the Rising Sun', 'The Animals', 'beginner', 'Am', 'https://www.ultimate-guitar.com/pro?song_id=3', 'Am C D F'),
('b1111111-1111-1111-1111-111111111111', 'Stairway to Heaven', 'Led Zeppelin', 'intermediate', 'Am', 'https://www.ultimate-guitar.com/pro?song_id=4', 'Am Asus2 Dsus2'),
('b2222222-2222-2222-2222-222222222222', 'Comfortably Numb', 'Pink Floyd', 'intermediate', 'B', 'https://www.ultimate-guitar.com/pro?song_id=5', 'B F# B F#'),
('b3333333-3333-3333-3333-333333333333', 'Hotel California', 'Eagles', 'intermediate', 'Bm', 'https://www.ultimate-guitar.com/pro?song_id=6', 'Bm F# Bm F#'),
('b4444444-4444-4444-4444-444444444444', 'Layla', 'Eric Clapton', 'intermediate', 'Dm', 'https://www.ultimate-guitar.com/pro?song_id=9', 'Dm Bb F'),
('c1111111-1111-1111-1111-111111111111', 'One', 'Metallica', 'advanced', 'Em', 'https://www.ultimate-guitar.com/pro?song_id=7', 'Em F# G A'),
('c2222222-2222-2222-2222-222222222222', 'Eruption', 'Van Halen', 'advanced', 'F#m', 'https://www.ultimate-guitar.com/pro?song_id=8', 'F#m'),
('c3333333-3333-3333-3333-333333333333', 'All of Me', 'John Legend', 'intermediate', 'A', 'https://www.ultimate-guitar.com/pro?song_id=10', 'A Dm E')
ON CONFLICT (id) DO NOTHING;

-- Seed lessons (lesson_teacher_number is set by trigger, so we disable it temporarily)
-- First disable the trigger
ALTER TABLE lessons DISABLE TRIGGER trigger_set_lesson_numbers;

INSERT INTO lessons (id, teacher_id, student_id, lesson_teacher_number, scheduled_at, status, notes) VALUES
('d1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 1, NOW() + INTERVAL '7 days', 'SCHEDULED', 'First lesson - basics'),
('d2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 2, NOW() + INTERVAL '14 days', 'SCHEDULED', 'Chord progressions'),
('d3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 1, NOW() + INTERVAL '7 days', 'SCHEDULED', 'Strumming patterns'),
('d4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 1, NOW(), 'COMPLETED', 'Practice session'),
('d5555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 1, NOW() + INTERVAL '10 days', 'SCHEDULED', 'Technique review')
ON CONFLICT (id) DO NOTHING;

-- Re-enable the trigger
ALTER TABLE lessons ENABLE TRIGGER trigger_set_lesson_numbers;

-- Seed lesson_songs
INSERT INTO lesson_songs (id, lesson_id, song_id, status, notes) VALUES
('e1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'to_learn', 'Start with Wonderwall'),
('e2222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'to_learn', 'Learn basic progression'),
('e3333333-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'started', 'Working on Stairway'),
('e4444444-4444-4444-4444-444444444444', 'd3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'remembered', 'Student remembered this'),
('e5555555-5555-5555-5555-555555555555', 'd4444444-4444-4444-4444-444444444444', 'b2222222-2222-2222-2222-222222222222', 'mastered', 'Completed'),
('e6666666-6666-6666-6666-666666666666', 'd4444444-4444-4444-4444-444444444444', 'b3333333-3333-3333-3333-333333333333', 'with_author', 'Played with backing track'),
('e7777777-7777-7777-7777-777777777777', 'd5555555-5555-5555-5555-555555555555', 'c1111111-1111-1111-1111-111111111111', 'to_learn', 'Advanced piece'),
('e8888888-8888-8888-8888-888888888888', 'd5555555-5555-5555-5555-555555555555', 'b4444444-4444-4444-4444-444444444444', 'started', 'Learning Layla')
ON CONFLICT (id) DO NOTHING;

-- Seed assignments (new structure with teacher_id, student_id)
INSERT INTO assignments (id, teacher_id, student_id, title, description, due_date, status) VALUES
('f1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Practice Wonderwall', 'Practice the basic progression daily', NOW() + INTERVAL '7 days', 'not_started'),
('f2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'Learn chord changes', 'Work on smooth chord transitions', NOW() + INTERVAL '3 days', 'in_progress'),
('f3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'Finger strength exercises', 'Do stretching exercises 3x daily', NOW() + INTERVAL '14 days', 'not_started'),
('f4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Record practice video', 'Record yourself playing and send', NOW() + INTERVAL '10 days', 'in_progress'),
('f5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'Attend group class', 'Monthly group guitar class', NOW() - INTERVAL '2 days', 'completed'),
('f6666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'Theory homework', 'Complete music theory worksheet', NOW() + INTERVAL '5 days', 'in_progress')
ON CONFLICT (id) DO NOTHING;
-- ============================================================================
-- LEGACY SONGS IMPORT
-- Imported from .LEGACY_DATA/songs.json
-- ON CONFLICT DO NOTHING to avoid duplicates
-- ============================================================================

INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('26ed9a10-eef6-4325-9b20-45c356f1376b', 'Whisky', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('d0cdb03a-ca3b-44ab-bd78-24c9f6258e98', 'Knocking on Heavens Door', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('610c102c-766b-49d2-ac19-432a8fbced30', 'House of the rising sun', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('2473bea9-797f-474b-aeb0-5881754cbf50', 'Teksanski', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('b36e1af1-ec93-4837-ac2c-e06269bb88b7', 'Hallelujah', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('e92a9d01-3b18-4482-8a29-85a781eadf68', 'Hit the road jack', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('f76aab61-2e65-4425-b443-abea5671f066', 'Sweet Home Alabama', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('d2254f21-d577-4c58-80c2-10285a7dfa9c', 'Moja i Twoja Nadzieja', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('bb9ff5d6-dec3-4538-8f75-19b1c9084fc2', 'Na co komu dzis', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('290c8775-3654-45a7-9f72-3b3e458b09a6', 'Zawsze tam gdzie Ty', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('b0b2fd6e-5f9f-4469-afc3-e3687ee48d4c', 'Crazy little thing called love', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('9b5e9c50-c178-4853-b6cb-d34eb3c711d2', 'Layla', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('d671ebc4-9fed-4c83-9a3b-b703ff0e691e', 'Tears in heaven', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('fe905a33-b717-4c07-82f7-8f010273eca9', 'Tolerancja', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('f5631a4e-84c5-4ce4-9c54-19e2e2c2689d', 'Everlong', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('f32a265b-29aa-48d8-89be-f8fef26903c6', 'Stand by me', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('bec19d4c-8417-43ff-976f-6bcbde59298d', 'Dust in the wind', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('a276efab-223f-4e44-b9e2-1fc9f64976cc', 'People are strange', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('b048944a-928f-4624-9a87-c3f00aa498ac', 'Yellow Submarine', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('5058a20b-0031-4fec-ac51-339897e9d238', 'Ho Hey', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('8c0d7ab6-c032-4ae6-bdc8-b62a81275737', 'Dani California', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('160d5c91-cf3f-4902-a39b-462b19360fb5', 'Gdzie ta keja', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('55e351f6-a8cb-46b6-a77d-72d60c83620d', 'Seven nation army', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('9a53ebf1-4787-417e-8226-e6ffab6e461c', 'Behind blue eyes', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('0f4554ee-db88-497e-a168-c5526291093a', 'Shape of you', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('5e948b7f-36eb-4e62-8d77-58ffd8aa2ca9', 'Smoke on the water', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('00469467-bd4d-4350-8dcc-c938f3ef60da', 'Chcialbym umrzec z milosci', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('bd608bac-4a74-46f3-a4ec-f09b3e9d6d99', 'Miec czy byc', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('e92c4e5e-db16-40ca-b8df-f9342a668961', 'Wonderwall', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('675e7aed-2b95-4f3e-99f5-8cbcfe95f33f', 'Baska', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('dad855c5-2c74-46da-95d7-33b5b3382914', 'Nie placz Ewka', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('03eaa195-0f18-483d-b73b-05cf3f576694', 'Money', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('0de4cea1-7d13-43ca-8139-0067fb5f6fad', 'Oprocz blekitnego nieba', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('33c2da5c-1d05-497b-9ed3-49c6b08af246', 'Are you gonna be my girl', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('cba6da4c-2f7f-480d-bf2f-7f2cfe0c8ecb', 'If I aint got you', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('14e9ddba-4ccc-4669-935f-cdd0295125ea', 'Nazywam sie niebo', NULL, NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('f44ec49a-e858-49e3-bc63-067b07c49076', 'Son of the blue sky', 'Wilki', 'beginner', 'G'::music_key, NULL, '{G,e,b,C}') ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('c84490dc-eec1-47ef-a597-f1a298ffda9b', 'Jak', 'SDM', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('8544503d-0236-4d49-8ca1-6530bb4e2d8f', 'Sultans of Swing', 'Dire Straits', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('02dfa2f2-876e-4e76-8a54-580d3f3a7a10', 'Best Part', 'Daniel Ceasar', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('2aa9263d-a46e-4c51-9e8f-b4f47e74680e', 'Okinawa', '92914', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('9e97951d-5f5e-41f0-b15b-c0d79893c85e', 'We''re going to Be Friends', 'The White Stripes', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('45ad3758-4dc9-4b66-aef5-1167c4b5f67a', 'Do I Wanna Know', 'Arctic Monkeys', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('7ea436c0-5587-44b4-ba6f-cdb6f7b1e26c', 'The Passenger', 'Iggy Pop', 'beginner', NULL, 'https://tabs.ultimate-guitar.com/tab/iggy-pop/the-passenger-chords-515997', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('d9008950-80ac-49b9-8ffe-0ac67413d2dd', 'Zanim pojde', 'Happysad', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('690cca0c-0566-429d-83d7-2e83ef742615', 'Wpusc mnie', 'Happysad', 'intermediate', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('58fef0df-e62b-4c1f-bc8a-a77943b45310', 'Jest Super', 'T.Love', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('d296391c-5660-4533-804a-676643caabdb', 'Everybody Hurts', 'REM', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('9affdec7-e3fb-463a-8954-b46d1c6439b5', 'Feel Good Inc', 'Gorillaz', 'beginner', NULL, 'https://tabs.ultimate-guitar.com/tab/gorillaz/feel-good-inc-tabs-200586', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('95955546-ec45-446a-8bce-5513849eacd1', 'Fly Away', 'Lenny Krawitz', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('dfde28e4-ff50-4d2a-becb-92d3159ffa7e', 'Where is my mind', 'The Pixiex', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('12f52d01-1ed4-45ce-bf66-872f79249db3', 'Chodz Pomaluj Moj Swiat', 'Dwa Plus Jeden', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('5abad57c-0d41-4524-b8a6-82160b04f16e', 'Arms Tonite', 'Mother Mother', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('9aa9a671-7472-492d-af8f-901476f2c516', 'San Francisco', 'Scott McKenzie', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('479fd9a1-a222-4800-b66e-d91840dd4af6', 'Don''t Forget Me', 'RHCP', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('3b06ebe6-4fa4-4b17-b43b-e3f869312944', 'Ostatni', 'Edyta Bartosiewicz', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('9c70bf44-7391-4887-bd03-aa1cdf9ef587', 'List do M.', 'Dzem', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('c4c103f4-7a97-4e47-8964-dc9e7395a68a', 'Harley Moj', 'Dzem', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('9efcc4de-a71a-4a0e-bcc5-63bf2fafd812', 'Float', 'Olivia Dean', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('c33f5813-b70b-4fcd-86e6-8c7b7f6a245b', 'Niebo bylo rozowe', 'Kaska Sochacka', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('06a0ca9b-a678-4800-8b8d-7ddf2424c1f4', 'Dla Ciebie', 'Myslovitz', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('329404ec-d8f7-493c-af4d-b574087db36f', 'Superman', 'Eminem', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('b6ff3ce8-7ba2-4413-ac04-44220ee49d7b', 'Can''t Help Falling in Love', 'Elvis Presley', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('622e2ed0-4e33-47c0-b97e-67e37abdf627', 'Cwiczenie D-dur', 'BRAK', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('176103f1-1275-4eea-9c95-4640626d140f', 'Whats My Age Again', 'Blink-182', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('0c8c4be8-5f40-48c6-a0d0-f66e81450cb5', 'Rumble', 'Link Wray', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('0ad0e5c6-dc46-4953-9121-1f8964c4623f', 'Should I Stay or Should I Go', 'The Clash', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('5c42a85a-3c07-4d92-bd7b-6fcf3f81ed5a', 'You Love Me ', 'Kimya Dawson', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('bd0b1264-f14e-45a8-b216-5915db8365d6', 'California', 'White 2115', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('5bf0a4c6-90c5-47d2-95e1-0ca50c3e1447', 'Animal Instinct', 'The Cranberries', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('108af0ae-7c17-41c4-859c-30eec4c5b80a', 'Zanim Pojde ', 'Happysad', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('e4dbdce6-038c-486b-8c74-2e84a6ca2d5e', 'Banana Pancakes', 'Jack Johnson', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('52ee6a38-fdc0-44c4-a19c-b4f5b19ed443', 'Back To Black', 'AC/DC', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('fb84d213-abb1-49a5-bcf3-495937fbfc58', 'Lonely Day', 'System of A Down', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('d6b9d070-5ba8-4141-b8a0-462789962d1c', 'Blackbird', 'The Beatles', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('a4bb32a8-be3e-4a46-a49f-63bf2b9409ce', 'Pierwszy/Przeswit', 'The Cassino', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('f6a67a54-305e-412b-8e59-86a386ab65b5', 'Zima', 'The Cassino', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('120beac1-4d28-46e3-9bb2-7533b0248de6', 'Ona jest ze snu', 'IRA', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('6e16d378-894e-4bfd-bc4d-f23efbf29014', 'Mimo Wszystko', 'Hey', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('f1d18851-b373-412e-92ca-f47cc6968823', 'Zazdrosc', 'Hey', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('5c25505b-93b9-4c02-b401-a8ec1ddc0ed4', 'Azizam', 'Ed Sheeran', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('46f05ff9-0f71-40df-8a66-fbd64fd6296d', 'Fluorescence Adolescence ', 'Arctic Monkeys', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('3d6f24b9-9b2b-4f1c-9587-f3ca271d8efc', 'Redbone', 'Andie', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('73f21f37-e7dc-4b45-bb0c-06d2adfbc747', 'Say Something', 'Justin Timberlake', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('1140e709-66c5-4587-99dc-017d2385bebf', 'Mas Que Nada', 'Sergio Mendes', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('2d12e63e-f896-4ae6-9797-60ee502eea5e', 'Jedwab', 'Róże Europy', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('9020dd99-315e-4d9b-baa0-4681d3bb4887', 'Basket Case', 'Green Day', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('bba95f39-0a71-4757-a428-7dd73d42d245', 'Lloret de Mar', 'Mata', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('d85177ef-c723-41f6-ba4e-0bebe36645eb', 'Wiosna', 'Zabili Mi Żólwia', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('2e90a9b8-9395-4e36-bdac-fafb423a9392', 'Rysunkowy Potwów', 'Chivas', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('d4d0ddce-85ef-421a-bea5-bbfec568d637', 'We Are The People', 'Empire of the Sun', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('b5dc308f-d940-486c-9ff6-36a346962525', 'Since You Been Gone', 'Kelly Clarkson', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('acf185a8-39e8-42d7-a3bd-580a15aff5ee', 'Trimm Trabb', 'Blur', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('86518f58-f1d5-468c-b91e-fa09678312d4', 'Synu', 'Sistars', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('5689049a-b5ad-45f4-ae55-ca09549965b8', 'Africa', 'Toto', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('be7b9986-b687-4824-9400-5db2f71a89e9', 'Zombie', 'The Cranberries', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('20a4d235-c56f-4205-9194-bbc60bcd5431', 'Better Than Me', 'The Brobecks', 'beginner', NULL, 'https://tabs.ultimate-guitar.com/tab/the-brobecks/better-than-me-chords-860284', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('56161458-2ba6-4132-8041-7278eba044ed', 'Schodki', 'Mata', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('9264a49b-50ce-4ee0-bd16-5e8a756de922', 'Wishing Well', 'Juice WRLD', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('f0ee6f0d-2494-448b-aa03-86bc5c10b0a4', 'All I Want', 'Kodaline', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('993981d8-6bc8-45ba-9f91-2cb330090cd6', 'Bylas Serca Biciem', 'Andrzej Zaucha', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('476ec3a8-7b76-4216-a8e5-2efee8646786', 'Pajaczek', 'Cwiczenia', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('27607158-f628-4b86-a22f-d48b16161ed4', 'Enter Sandman', 'Metallica', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('e391071a-cd5a-4a11-902b-69a7285e4b40', 'Hurt', 'Johny Cash', 'beginner', 'Am'::music_key, 'https://tabs.ultimate-guitar.com/tab/johnny-cash/hurt-chords-89849', 'a ') ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('615f3ce4-ddbc-407b-824f-06dd035aba68', 'Raissa', 'Strachy na Lachy', 'intermediate', 'Am'::music_key, 'https://tabs.ultimate-guitar.com/tab/strachy-na-lachy/raissa-chords-496625', 'a G C E') ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('01a2bfb5-8940-40c1-b8ad-55f0cc8e2fcc', 'TV', 'Billie Ellish', 'intermediate', 'G'::music_key, 'https://tabs.ultimate-guitar.com/tab/billie-eilish/tv-chords-4224094', ' G f e C D') ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('dfa87aa3-c46e-4a9f-9d6c-f2e05067f293', 'Change the Wrold', 'Eric Clapton', 'intermediate', 'E'::music_key, 'https://tabs.ultimate-guitar.com/tab/eric-clapton/change-the-world-chords-63570', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('3fcc840d-b984-4b3b-a55d-8888681c0eab', 'Again', 'Lenny Kravitz', 'intermediate', 'A'::music_key, 'https://tabs.ultimate-guitar.com/tab/lenny-kravitz/again-tabs-105799', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('73690d14-68d5-4827-846f-2ef4b1952a35', 'Dont Let Me Be Misunderstood ', 'The Animals', 'intermediate', 'Bm'::music_key, 'https://tabs.ultimate-guitar.com/tab/the-animals/dont-let-me-be-misunderstood-chords-18691', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('3e8a686e-f693-4431-b7f2-317118062cb8', 'Pod Katem Ostrym', 'SDM', 'beginner', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO songs (id, title, author, level, key, ultimate_guitar_link, chords) VALUES ('19fad2c8-f9fa-4bf3-ac12-80bcc4a61006', 'Verbatim', 'Mother Mother', 'beginner', 'C'::music_key, NULL, NULL) ON CONFLICT (id) DO NOTHING;

-- Total: 111 legacy songs imported

