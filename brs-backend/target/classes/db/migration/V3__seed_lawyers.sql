-- ============================================================
-- V3__seed_lawyers.sql
-- BRS v2.0 - Additional Lawyer Profiles Seed Data
-- ============================================================

-- ============================================================
-- Additional Lawyer Profiles
-- ============================================================
INSERT INTO lawyer_profiles (id, user_id, slug, name_vi, name_en, bio_vi, bio_en, position_vi, position_en, experience_years, bar_number, languages, is_featured, working_hours, created_at, updated_at)
VALUES 
    ('lv000003-0001-0001-0001-000000000003', NULL, 'luat-su-pham-thi-c', 'Phạm Thị Chung', 'Pham Thi Chung', 'Luật sư Chung chuyên về luật bất động sản và thuế. Bà có 12 năm kinh nghiệm tư vấn cho các dự án bất động sản lớn tại TP.HCM và các tỉnh lân cận.', 'Lawyer Chung specializes in real estate and tax law. She has 12 years of experience advising on large real estate projects in Ho Chi Minh City and neighboring provinces.', 'Luật Sư', 'Associate', 12, 'LS-009012', ARRAY['vi', 'en'], false, '{"monday": {"start": "08:30", "end": "17:30"}, "tuesday": {"start": "08:30", "end": "17:30"}, "wednesday": {"start": "08:30", "end": "17:30"}, "thursday": {"start": "08:30", "end": "17:30"}, "friday": {"start": "08:30", "end": "17:30"}}', NOW(), NOW()),
    ('lv000004-0001-0001-0001-000000000004', NULL, 'luat-su-le-van-d', 'Lê Văn Đạt', 'Le Van Dat', 'Luật sư Đạt là chuyên gia về luật hình sự và bảo vệ quyền con người. Anh đã tham gia nhiều vụ án lớn và có kinh nghiệm phong phú trong việc bào chữa.', 'Lawyer Dat is an expert in criminal law and human rights protection. He has participated in many major cases and has extensive experience in defense.', 'Luật Sư Trưởng', 'Senior Associate', 8, 'LS-003456', ARRAY['vi', 'en', 'fr'], true, '{"monday": {"start": "08:00", "end": "18:00"}, "tuesday": {"start": "08:00", "end": "18:00"}, "wednesday": {"start": "08:00", "end": "18:00"}, "thursday": {"start": "08:00", "end": "18:00"}, "friday": {"start": "08:00", "end": "18:00"}}', NOW(), NOW());

-- Additional Lawyer Services
INSERT INTO service_lawyers (service_id, lawyer_id, is_primary)
VALUES 
    ('88888888-8888-8888-8888-888888888888', 'lv000003-0001-0001-0001-000000000003', true),
    ('44444444-4444-4444-4444-444444444444', 'lv000003-0001-0001-0001-000000000003', false),
    ('33333333-3333-3333-3333-333333333333', 'lv000004-0001-0001-0001-000000000004', true),
    ('11111111-1111-1111-1111-111111111111', 'lv000004-0001-0001-0001-000000000004', false);

-- Additional Lawyer Availability
INSERT INTO lawyer_availability (lawyer_id, day_of_week, start_time, end_time, slot_duration, is_active)
VALUES 
    ('lv000003-0001-0001-0001-000000000003', 1, '08:30', '17:30', 60, true),
    ('lv000003-0001-0001-0001-000000000003', 2, '08:30', '17:30', 60, true),
    ('lv000003-0001-0001-0001-000000000003', 3, '08:30', '17:30', 60, true),
    ('lv000003-0001-0001-0001-000000000003', 4, '08:30', '17:30', 60, true),
    ('lv000003-0001-0001-0001-000000000003', 5, '08:30', '17:30', 60, true),
    ('lv000004-0001-0001-0001-000000000004', 1, '08:00', '18:00', 60, true),
    ('lv000004-0001-0001-0001-000000000004', 2, '08:00', '18:00', 60, true),
    ('lv000004-0001-0001-0001-000000000004', 3, '08:00', '18:00', 60, true),
    ('lv000004-0001-0001-0001-000000000004', 4, '08:00', '18:00', 60, true),
    ('lv000004-0001-0001-0001-000000000004', 5, '08:00', '18:00', 60, true);

-- Additional Reviews for Lawyers
INSERT INTO reviews (id, client_name, client_role, content_vi, content_en, rating, lawyer_id, is_featured, is_published, source, created_at)
VALUES 
    ('rv000004-0001-0001-0001-000000000004', 'Bà Trần Thị Mai', 'CTY TNHH ABC', 'Luật sư Chung đã giúp tôi giải quyết vấn đề thuế cho công ty một cách nhanh chóng. Bà rất am hiểu luật thuế và tư vấn rất chi tiết.', 'Lawyer Chung helped me resolve tax issues for the company quickly. She is very knowledgeable about tax law and provided very detailed advice.', 5, 'lv000003-0001-0001-0001-000000000003', false, true, 'WEBSITE', NOW()),
    ('rv000005-0001-0001-0001-000000000005', 'Anh Ngô Văn Hùng', 'Doanh Nhân', 'Luật sư Đạt là một luật sư xuất sắc trong lĩnh vực hình sự. Anh đã bào chữa thành công cho tôi trong vụ án phức tạp. Highly recommended!', 'Lawyer Dat is an excellent lawyer in criminal law. He successfully defended me in a complex case. Highly recommended!', 5, 'lv000004-0001-0001-0001-000000000004', true, true, 'WEBSITE', NOW());
