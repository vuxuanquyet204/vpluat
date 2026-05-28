-- ============================================================
-- V3__seed_lawyers.sql
-- BRS v2.0 - Additional Lawyer Profiles Seed Data
-- ============================================================

-- ============================================================
-- Additional Lawyer Profiles
-- ============================================================
INSERT INTO lawyer_profiles (id, user_id, slug, name_vi, name_en, bio_vi, bio_en, position_vi, position_en, experience_years, bar_number, languages, is_featured, working_hours, created_at, updated_at)
VALUES 
    (gen_random_uuid(), NULL, 'luat-su-pham-thi-c', 'Phạm Thị Chung', 'Pham Thi Chung',
     'Luật sư Chung chuyên về luật bất động sản và thuế.',
     'Lawyer Chung specializes in real estate and tax law.',
     'Luật Sư', 'Associate', 12, 'LS-009012', ARRAY['vi', 'en'], false,
     '{"monday": {"start": "08:30", "end": "17:30"}}',
     NOW(), NOW()),
    (gen_random_uuid(), NULL, 'luat-su-le-van-d', 'Lê Văn Đạt', 'Le Van Dat',
     'Luật sư Đạt là chuyên gia về luật hình sự và bảo vệ quyền con người.',
     'Lawyer Dat is an expert in criminal law and human rights protection.',
     'Luật Sư Trưởng', 'Senior Associate', 8, 'LS-003456', ARRAY['vi', 'en', 'fr'], true,
     '{"monday": {"start": "08:00", "end": "18:00"}}',
     NOW(), NOW());

-- Additional Reviews for Lawyers
INSERT INTO reviews (id, client_name, client_role, content_vi, content_en, rating, is_featured, is_published, source, created_at)
VALUES 
    (gen_random_uuid(), 'Bà Trần Thị Mai', 'CTY TNHH ABC',
     'Luật sư Chung đã giúp tôi giải quyết vấn đề thuế cho công ty một cách nhanh chóng.',
     'Lawyer Chung helped me resolve tax issues for the company quickly.',
     5, false, true, 'WEBSITE', NOW()),
    (gen_random_uuid(), 'Anh Ngô Văn Hùng', 'Doanh Nhân',
     'Luật sư Đạt là một luật sư xuất sắc trong lĩnh vực hình sự.',
     'Lawyer Dat is an excellent lawyer in criminal law.',
     5, true, true, 'WEBSITE', NOW());
