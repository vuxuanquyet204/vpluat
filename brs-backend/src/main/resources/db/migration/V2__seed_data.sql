-- ============================================================
-- V2__seed_data.sql
-- BRS v2.0 - Initial Seed Data
-- ============================================================

-- ============================================================
-- ROLES & PERMISSIONS (Application-level enum)
-- ============================================================
-- Roles: SUPER_ADMIN, ADMIN, EDITOR, CSKH, LAWYER, USER

-- ============================================================
-- ADMIN USER
-- ============================================================
INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active, created_at, updated_at)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@lawfirm.vn',
    '$2a$12$GPXD4qiPJ1e0p6wojtUF4eb5jn4vkJfxfjMO35EXu3ag0GK6j5R.G', -- password: Admin@123
    'SUPER_ADMIN',
    'Quản Trị Viên',
    '0912345678',
    true,
    NOW(),
    NOW()
);

-- ============================================================
-- TEST USERS
-- ============================================================
INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active, created_at, updated_at)
VALUES 
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'editor@lawfirm.vn', '$2a$12$GPXD4qiPJ1e0p6wojtUF4eb5jn4vkJfxfjMO35EXu3ag0GK6j5R.G', 'EDITOR', 'Người Biên Tập', '0912345679', true, NOW(), NOW()),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'cskh@lawfirm.vn', '$2a$12$GPXD4qiPJ1e0p6wojtUF4eb5jn4vkJfxfjMO35EXu3ag0GK6j5R.G', 'CSKH', 'Nhân Viên CSKH', '0912345680', true, NOW(), NOW()),
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'lawyer1@lawfirm.vn', '$2a$12$GPXD4qiPJ1e0p6wojtUF4eb5jn4vkJfxfjMO35EXu3ag0GK6j5R.G', 'LAWYER', 'Luật Sư Một', '0912345681', true, NOW(), NOW()),
    ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'lawyer2@lawfirm.vn', '$2a$12$GPXD4qiPJ1e0p6wojtUF4eb5jn4vkJfxfjMO35EXu3ag0GK6j5R.G', 'LAWYER', 'Luật Sư Hai', '0912345682', true, NOW(), NOW()),
    ('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'user@lawfirm.vn', '$2a$12$GPXD4qiPJ1e0p6wojtUF4eb5jn4vkJfxfjMO35EXu3ag0GK6j5R.G', 'USER', 'Người Dùng Test', '0912345683', true, NOW(), NOW());
-- ============================================================
-- SERVICES (Dịch Vụ Pháp Lý)
-- ============================================================
WITH services_data AS (
    INSERT INTO services (id, slug, icon, is_featured, display_order, is_active, created_at, updated_at, created_by)
    VALUES 
        (gen_random_uuid(), 'tu-van-phap-ly', 'scale', true, 1, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
        (gen_random_uuid(), 'dai-dien-phap-ly', 'gavel', true, 2, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
        (gen_random_uuid(), 'to-cao-khieu-nai', 'flag', true, 3, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
        (gen_random_uuid(), 'thu-tuc-hanh-chinh', 'folder', false, 4, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
        (gen_random_uuid(), 'so-huu-tri-tue', 'lightbulb', false, 5, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
        (gen_random_uuid(), 'lao-dong', 'users', false, 6, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
        (gen_random_uuid(), 'doanh-nghiep', 'briefcase', false, 7, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
        (gen_random_uuid(), 'nha-dat', 'home', false, 8, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    RETURNING id, slug
)
INSERT INTO locale_keys (entity_type, entity_id, locale, title, excerpt, content, meta_title, meta_desc)
SELECT 'services', id,
    CASE slug
        WHEN 'tu-van-phap-ly' THEN 'vi'
        WHEN 'dai-dien-phap-ly' THEN 'vi'
        WHEN 'to-cao-khieu-nai' THEN 'vi'
        WHEN 'thu-tuc-hanh-chinh' THEN 'vi'
        WHEN 'so-huu-tri-tue' THEN 'vi'
        WHEN 'lao-dong' THEN 'vi'
        WHEN 'doanh-nghiep' THEN 'vi'
        WHEN 'nha-dat' THEN 'vi'
    END,
    CASE slug
        WHEN 'tu-van-phap-ly' THEN 'Tư Vấn Pháp Lý'
        WHEN 'dai-dien-phap-ly' THEN 'Đại Diện Pháp Lý'
        WHEN 'to-cao-khieu-nai' THEN 'Tố Cáo, Khiếu Nại'
        WHEN 'thu-tuc-hanh-chinh' THEN 'Thủ Tục Hành Chính'
        WHEN 'so-huu-tri-tue' THEN 'Sở Hữu Trí Tuệ'
        WHEN 'lao-dong' THEN 'Lao Động'
        WHEN 'doanh-nghiep' THEN 'Doanh Nghiệp'
        WHEN 'nha-dat' THEN 'Nhà Đất'
    END,
    'Mô tả chi tiết dịch vụ...',
    'Nội dung chi tiết...',
    CASE slug
        WHEN 'tu-van-phap-ly' THEN 'Tư Vấn Pháp Lý - LawFirm'
        WHEN 'dai-dien-phap-ly' THEN 'Đại Diện Pháp Lý - LawFirm'
        WHEN 'to-cao-khieu-nai' THEN 'Tố Cáo Khiếu Nại - LawFirm'
        WHEN 'thu-tuc-hanh-chinh' THEN 'Thủ Tục Hành Chính - LawFirm'
        WHEN 'so-huu-tri-tue' THEN 'Sở Hữu Trí Tuệ - LawFirm'
        WHEN 'lao-dong' THEN 'Luật Lao Động - LawFirm'
        WHEN 'doanh-nghiep' THEN 'Luật Doanh Nghiệp - LawFirm'
        WHEN 'nha-dat' THEN 'Luật Nhà Đất - LawFirm'
    END,
    'Mô tả SEO...'
FROM services_data;

-- English translations for services
WITH services_data AS (
    SELECT id, slug FROM services
)
INSERT INTO locale_keys (entity_type, entity_id, locale, title, excerpt, content, meta_title, meta_desc)
SELECT 'services', id, 'en',
    CASE slug
        WHEN 'tu-van-phap-ly' THEN 'Legal Consultation'
        WHEN 'dai-dien-phap-ly' THEN 'Legal Representation'
        WHEN 'to-cao-khieu-nai' THEN 'Complaints & Appeals'
        WHEN 'thu-tuc-hanh-chinh' THEN 'Administrative Procedures'
        WHEN 'so-huu-tri-tue' THEN 'Intellectual Property'
        WHEN 'lao-dong' THEN 'Labor Law'
        WHEN 'doanh-nghiep' THEN 'Corporate Law'
        WHEN 'nha-dat' THEN 'Real Estate'
    END,
    'Professional legal services...',
    'Detailed content...',
    CASE slug
        WHEN 'tu-van-phap-ly' THEN 'Legal Consultation - LawFirm'
        WHEN 'dai-dien-phap-ly' THEN 'Legal Representation - LawFirm'
        WHEN 'to-cao-khieu-nai' THEN 'Complaints & Appeals - LawFirm'
        WHEN 'thu-tuc-hanh-chinh' THEN 'Administrative Procedures - LawFirm'
        WHEN 'so-huu-tri-tue' THEN 'Intellectual Property - LawFirm'
        WHEN 'lao-dong' THEN 'Labor Law - LawFirm'
        WHEN 'doanh-nghiep' THEN 'Corporate Law - LawFirm'
        WHEN 'nha-dat' THEN 'Real Estate Law - LawFirm'
    END,
    'SEO description...'
FROM services_data;

-- ============================================================
-- FAQS (Câu Hỏi Thường Gặp)
-- ============================================================
WITH faqs_data AS (
    INSERT INTO faqs (id, service_id, display_order, is_published, created_at, updated_at, created_by)
    SELECT gen_random_uuid(), id, 1, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    FROM services WHERE slug = 'tu-van-phap-ly'
    RETURNING id
)
INSERT INTO locale_keys (entity_type, entity_id, locale, title, content)
SELECT 'faqs', id, 'vi', 'Chi phí tư vấn pháp lý là bao nhiêu?',
    'Chi phí tư vấn pháp lý dao động từ 500.000 VNĐ đến 3.000.000 VNĐ tùy theo tính chất và mức độ phức tạp của vụ việc.'
FROM faqs_data;

WITH faqs_data AS (
    SELECT id FROM faqs
)
INSERT INTO locale_keys (entity_type, entity_id, locale, title, content)
SELECT 'faqs', id, 'en', 'How much does legal consultation cost?',
    'Legal consultation fees range from 500,000 VND to 3,000,000 VND depending on the nature and complexity of the case.'
FROM faqs_data;

-- ============================================================
-- LAWYER PROFILES
-- ============================================================
INSERT INTO lawyer_profiles (id, user_id, slug, name_vi, name_en, bio_vi, bio_en, position_vi, position_en, experience_years, bar_number, languages, is_featured, working_hours, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'luat-su-nguyen-van-an', 'Nguyễn Văn An', 'Nguyen Van An',
     'Luật sư An có hơn 15 năm kinh nghiệm trong lĩnh vực luật kinh doanh và sở hữu trí tuệ.',
     'Lawyer An has over 15 years of experience in business and intellectual property law.',
     'Luật Sư Cao Cấp', 'Senior Partner', 15, 'LS-001234', ARRAY['vi', 'en'], true,
     '{"monday": {"start": "08:00", "end": "17:00"}, "tuesday": {"start": "08:00", "end": "17:00"}}',
     NOW(), NOW()),
    (gen_random_uuid(), 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'luat-su-tran-thi-b', 'Trần Thị Bình', 'Tran Thi Binh',
     'Luật sư Bình chuyên về luật lao động và giải quyết tranh chấp.',
     'Lawyer Binh specializes in labor law and dispute resolution.',
     'Luật Sư', 'Associate', 10, 'LS-005678', ARRAY['vi', 'en', 'ja'], true,
     '{"monday": {"start": "09:00", "end": "18:00"}, "tuesday": {"start": "09:00", "end": "18:00"}}',
     NOW(), NOW());

-- ============================================================
-- REVIEWS (Đánh Giá)
-- ============================================================
INSERT INTO reviews (id, client_name, client_role, content_vi, content_en, rating, is_featured, is_published, source, created_at)
VALUES 
    (gen_random_uuid(), 'Ông Hoàng Minh Đức', 'Giám Đốc Công Ty ABC',
     'Tôi rất hài lòng với dịch vụ tư vấn pháp lý của LawFirm.',
     'I am very satisfied with the legal consultation service of LawFirm.',
     5, true, true, 'WEBSITE', NOW()),
    (gen_random_uuid(), 'Bà Nguyễn Thị Hương', 'Chủ Doanh Nghiệp Tư Nhân',
     'LawFirm đã hỗ trợ tôi rất nhiều trong việc thành lập doanh nghiệp.',
     'LawFirm has supported me a lot in establishing my business.',
     5, true, true, 'WEBSITE', NOW());

-- ============================================================
-- CATEGORIES (Danh Mục Bài Viết)
-- ============================================================
INSERT INTO categories (id, slug, meta_title_vi, meta_title_en, meta_desc_vi, meta_desc_en, display_order, created_at, updated_at, created_by)
VALUES 
    (gen_random_uuid(), 'tin-tuc-phap-luat', 'Tin Tức Pháp Luật', 'Legal News', 'Cập nhật tin tức pháp luật mới nhất', 'Latest legal news updates', 1, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    (gen_random_uuid(), 'huong-dan-thu-tuc', 'Hướng Dẫn Thủ Tục', 'Procedures Guide', 'Hướng dẫn các thủ tục pháp lý', 'Guide to legal procedures', 2, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    (gen_random_uuid(), 'kien-thuc-phap-ly', 'Kiến Thức Pháp Lý', 'Legal Knowledge', 'Chia sẻ kiến thức pháp lý hữu ích', 'Share useful legal knowledge', 3, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- ============================================================
-- TAGS
-- ============================================================
INSERT INTO tags (id, slug, created_at, updated_at, created_by)
VALUES 
    (gen_random_uuid(), 'luat-kinh-doanh', NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    (gen_random_uuid(), 'luat-lao-dong', NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    (gen_random_uuid(), 'so-huu-tri-tue', NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    (gen_random_uuid(), 'thue-thu-nhap', NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    (gen_random_uuid(), 'hop-dong', NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- ============================================================
-- NEWSLETTER SUBSCRIBERS (Sample)
-- ============================================================
INSERT INTO newsletter_subscribers (id, email, name, status, verified_at, source, created_at)
VALUES 
    (gen_random_uuid(), 'contact@company1.vn', 'Công Ty ABC', 'VERIFIED', NOW(), 'WEBSITE', NOW()),
    (gen_random_uuid(), 'info@company2.vn', 'Công Ty XYZ', 'VERIFIED', NOW(), 'WEBSITE', NOW());

-- ============================================================
-- JOB POSTINGS (Sample)
-- ============================================================
INSERT INTO job_postings (id, title, title_en, department, location, job_type, description_vi, description_en, requirements_vi, requirements_en, salary_range, status, deadline, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 
     'Tuyển Dụng Luật Sư Thực Tập', 
     'Recruiting Junior Lawyer',
     'Pháp Chế',
     'Hồ Chí Minh',
     'FULL_TIME',
     'Chúng tôi đang tìm kiếm ứng viên xuất sắc cho vị trí Luật sư thực tập.',
     'We are looking for outstanding candidates for the Junior Lawyer position.',
     '- Tốt nghiệp Luật từ Đại học Quốc gia hoặc tương đương\n- Có chứng chỉ hành nghề luật sư là điểm cộng',
     '- Graduated in Law from National University or equivalent\n- Having a lawyer practice certificate is a plus',
     '15-25 triệu VNĐ/tháng',
     'PUBLISHED',
     '2026-06-30',
     NOW(),
     NOW());
