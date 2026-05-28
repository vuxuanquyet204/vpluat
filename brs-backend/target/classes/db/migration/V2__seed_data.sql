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
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qJQXNgPq8.YJDW', -- password: Admin@123
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
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'editor@lawfirm.vn', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qJQXNgPq8.YJDW', 'EDITOR', 'Người Biên Tập', '0912345679', true, NOW(), NOW()),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'cskh@lawfirm.vn', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qJQXNgPq8.YJDW', 'CSKH', 'Nhân Viên CSKH', '0912345680', true, NOW(), NOW()),
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'lawyer1@lawfirm.vn', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qJQXNgPq8.YJDW', 'LAWYER', 'Luật Sư Một', '0912345681', true, NOW(), NOW()),
    ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'lawyer2@lawfirm.vn', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qJQXNgPq8.YJDW', 'LAWYER', 'Luật Sư Hai', '0912345682', true, NOW(), NOW()),
    ('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'user@lawfirm.vn', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qJQXNgPq8.YJDW', 'USER', 'Người Dùng Test', '0912345683', true, NOW(), NOW());

-- ============================================================
-- SERVICES (Dịch Vụ Pháp Lý)
-- ============================================================
INSERT INTO services (id, slug, icon, is_featured, display_order, is_active, created_at, updated_at, created_by)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'tu-van-phap-ly', 'scale', true, 1, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('22222222-2222-2222-2222-222222222222', 'dai-dien-phap-ly', 'gavel', true, 2, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('33333333-3333-3333-3333-333333333333', 'to-cao-khieu-nai', 'flag', true, 3, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('44444444-4444-4444-4444-444444444444', 'thu-tuc-hanh-chinh', 'folder', false, 4, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('55555555-5555-5555-5555-555555555555', 'so-huu-tri-tue', 'lightbulb', false, 5, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('66666666-6666-6666-6666-666666666666', 'lao-dong', 'users', false, 6, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('77777777-7777-7777-7777-777777777777', 'doanh-nghiep', 'briefcase', false, 7, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('88888888-8888-8888-8888-888888888888', 'nha-dat', 'home', false, 8, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- Service Translations (Vietnamese)
INSERT INTO locale_keys (entity_type, entity_id, locale, title, excerpt, content, meta_title, meta_desc)
VALUES 
    ('services', '11111111-1111-1111-1111-111111111111', 'vi', 'Tư Vấn Pháp Lý', 'Dịch vụ tư vấn pháp lý chuyên nghiệp cho cá nhân và doanh nghiệp', 'Nội dung chi tiết về dịch vụ tư vấn pháp lý...', 'Tư Vấn Pháp Lý - LawFirm', 'Dịch vụ tư vấn pháp lý chuyên nghiệp với đội ngũ luật sư giàu kinh nghiệm'),
    ('services', '22222222-2222-2222-2222-222222222222', 'vi', 'Đại Diện Pháp Lý', 'Dịch vụ đại diện pháp lý trước tòa án và cơ quan nhà nước', 'Nội dung chi tiết về dịch vụ đại diện pháp lý...', 'Đại Diện Pháp Lý - LawFirm', 'Đại diện pháp lý chuyên nghiệp bởi đội ngũ luật sư có nhiều năm kinh nghiệm'),
    ('services', '33333333-3333-3333-3333-333333333333', 'vi', 'Tố Cáo, Khiếu Nại', 'Dịch vụ tố cáo, khiếu nại và giải quyết tranh chấp', 'Nội dung chi tiết về dịch vụ tố cáo, khiếu nại...', 'Tố Cáo Khiếu Nại - LawFirm', 'Hỗ trợ tố cáo, khiếu nại với quy trình chuyên nghiệp'),
    ('services', '44444444-4444-4444-4444-444444444444', 'vi', 'Thủ Tục Hành Chính', 'Tư vấn và thực hiện các thủ tục hành chính', 'Nội dung chi tiết về thủ tục hành chính...', 'Thủ Tục Hành Chính - LawFirm', 'Hướng dẫn thủ tục hành chính nhanh chóng, chính xác'),
    ('services', '55555555-5555-5555-5555-555555555555', 'vi', 'Sở Hữu Trí Tuệ', 'Bảo vệ quyền sở hữu trí tuệ cho cá nhân và doanh nghiệp', 'Nội dung chi tiết về sở hữu trí tuệ...', 'Sở Hữu Trí Tuệ - LawFirm', 'Đăng ký bảo hộ sở hữu trí tuệ chuyên nghiệp'),
    ('services', '66666666-6666-6666-6666-666666666666', 'vi', 'Lao Động', 'Tư vấn và giải quyết các vấn đề liên quan đến lao động', 'Nội dung chi tiết về luật lao động...', 'Luật Lao Động - LawFirm', 'Tư vấn pháp lý về quan hệ lao động, hợp đồng lao động'),
    ('services', '77777777-7777-7777-7777-777777777777', 'vi', 'Doanh Nghiệp', 'Thành lập và quản lý doanh nghiệp theo pháp luật', 'Nội dung chi tiết về luật doanh nghiệp...', 'Luật Doanh Nghiệp - LawFirm', 'Tư vấn thành lập, sáp nhập, giải thể doanh nghiệp'),
    ('services', '88888888-8888-8888-8888-888888888888', 'vi', 'Nhà Đất', 'Tư vấn và hỗ trợ các vấn đề liên quan đến bất động sản', 'Nội dung chi tiết về luật nhà đất...', 'Luật Nhà Đất - LawFirm', 'Tư vấn mua bán, thuê, chuyển nhượng bất động sản');

-- Service Translations (English)
INSERT INTO locale_keys (entity_type, entity_id, locale, title, excerpt, content, meta_title, meta_desc)
VALUES 
    ('services', '11111111-1111-1111-1111-111111111111', 'en', 'Legal Consultation', 'Professional legal consultation services for individuals and businesses', 'Detailed content about legal consultation services...', 'Legal Consultation - LawFirm', 'Professional legal consultation with experienced lawyers'),
    ('services', '22222222-2222-2222-2222-222222222222', 'en', 'Legal Representation', 'Legal representation services before courts and government agencies', 'Detailed content about legal representation services...', 'Legal Representation - LawFirm', 'Professional legal representation by experienced lawyers'),
    ('services', '33333333-3333-3333-3333-333333333333', 'en', 'Complaints & Appeals', 'Complaints, appeals and dispute resolution services', 'Detailed content about complaints and appeals...', 'Complaints & Appeals - LawFirm', 'Professional complaint and appeal support services'),
    ('services', '44444444-4444-4444-4444-444444444444', 'en', 'Administrative Procedures', 'Consultation and implementation of administrative procedures', 'Detailed content about administrative procedures...', 'Administrative Procedures - LawFirm', 'Fast and accurate administrative procedure guidance'),
    ('services', '55555555-5555-5555-5555-555555555555', 'en', 'Intellectual Property', 'Intellectual property protection for individuals and businesses', 'Detailed content about intellectual property...', 'Intellectual Property - LawFirm', 'Professional intellectual property registration and protection'),
    ('services', '66666666-6666-6666-6666-666666666666', 'en', 'Labor Law', 'Consultation and resolution of labor-related issues', 'Detailed content about labor law...', 'Labor Law - LawFirm', 'Legal consultation on labor relations and employment contracts'),
    ('services', '77777777-7777-7777-7777-777777777777', 'en', 'Corporate Law', 'Establishing and managing businesses according to law', 'Detailed content about corporate law...', 'Corporate Law - LawFirm', 'Consultation on business establishment, merger, and dissolution'),
    ('services', '88888888-8888-8888-8888-888888888888', 'en', 'Real Estate', 'Consultation and support for real estate-related issues', 'Detailed content about real estate law...', 'Real Estate Law - LawFirm', 'Consultation on real estate purchase, lease, and transfer');

-- ============================================================
-- FAQS (Câu Hỏi Thường Gặp)
-- ============================================================
INSERT INTO faqs (id, service_id, display_order, is_published, created_at, updated_at, created_by)
VALUES 
    ('fa000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 1, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('fa000002-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 2, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('fa000003-0001-0001-0001-000000000003', '22222222-2222-2222-2222-222222222222', 1, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('fa000004-0001-0001-0001-000000000004', '33333333-3333-3333-3333-333333333333', 1, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('fa000005-0001-0001-0001-000000000005', '66666666-6666-6666-6666-666666666666', 1, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

INSERT INTO locale_keys (entity_type, entity_id, locale, title, content)
VALUES 
    ('faqs', 'fa000001-0001-0001-0001-000000000001', 'vi', 'Chi phí tư vấn pháp lý là bao nhiêu?', 'Chi phí tư vấn pháp lý dao động từ 500.000 VNĐ đến 3.000.000 VNĐ tùy theo tính chất và mức độ phức tạp của vụ việc. Vui lòng liên hệ trực tiếp để được báo giá cụ thể.'),
    ('faqs', 'fa000001-0001-0001-0001-000000000001', 'en', 'How much does legal consultation cost?', 'Legal consultation fees range from 500,000 VND to 3,000,000 VND depending on the nature and complexity of the case. Please contact us for specific pricing.'),
    ('faqs', 'fa000002-0001-0001-0001-000000000002', 'vi', 'Tôi cần chuẩn bị gì khi đến tư vấn?', 'Quý khách vui lòng mang theo: (1) CMND/CCCD, (2) các giấy tờ liên quan đến vụ việc, (3) ghi chép các câu hỏi muốn hỏi để buổi tư vấn đạt hiệu quả cao nhất.'),
    ('faqs', 'fa000002-0001-0001-0001-000000000002', 'en', 'What should I prepare when coming for consultation?', 'Please bring: (1) ID card, (2) relevant documents related to your case, (3) notes of questions you want to ask for the most effective consultation.'),
    ('faqs', 'fa000003-0001-0001-0001-000000000003', 'vi', 'Luật sư có thể đại diện tôi tại tòa không?', 'Có, chúng tôi cung cấp dịch vụ đại diện pháp lý trước tòa án các cấp. Luật sư sẽ thay mặt bạn tham gia tố tụng và bảo vệ quyền lợi trong suốt quá trình.'),
    ('faqs', 'fa000003-0001-0001-0001-000000000003', 'en', 'Can a lawyer represent me in court?', 'Yes, we provide legal representation services at all court levels. The lawyer will represent you throughout the proceedings and protect your interests.'),
    ('faqs', 'fa000004-0001-0001-0001-000000000004', 'vi', 'Thời gian giải quyết khiếu nại là bao lâu?', 'Thời gian giải quyết khiếu nại phụ thuộc vào tính chất của vụ việc. Thông thường từ 30 đến 90 ngày làm việc. Chúng tôi sẽ thông báo tiến độ thường xuyên.'),
    ('faqs', 'fa000004-0001-0001-0001-000000000004', 'en', 'How long does it take to resolve a complaint?', 'The time to resolve a complaint depends on the nature of the case. Usually 30 to 90 working days. We will notify you of the progress regularly.'),
    ('faqs', 'fa000005-0001-0001-0001-000000000005', 'vi', 'Tôi bị sa thải trái pháp luật, tôi nên làm gì?', 'Bạn nên: (1) Giữ lại tất cả các giấy tờ liên quan đến công việc, (2) Liên hệ ngay với chúng tôi để được tư vấn, (3) Không ký bất kỳ giấy tờ nào mà chưa hiểu rõ nội dung.'),
    ('faqs', 'fa000005-0001-0001-0001-000000000005', 'en', 'I was fired illegally, what should I do?', 'You should: (1) Keep all documents related to your work, (2) Contact us immediately for consultation, (3) Do not sign any documents without understanding the content.');

-- ============================================================
-- LAWYER PROFILES
-- ============================================================
INSERT INTO lawyer_profiles (id, user_id, slug, name_vi, name_en, bio_vi, bio_en, position_vi, position_en, experience_years, bar_number, languages, is_featured, working_hours, created_at, updated_at)
VALUES 
    ('lv000001-0001-0001-0001-000000000001', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'luat-su-nguyen-van-an', 'Nguyễn Văn An', 'Nguyen Van An', 'Luật sư An có hơn 15 năm kinh nghiệm trong lĩnh vực luật kinh doanh và sở hữu trí tuệ. Ông đã tư vấn cho nhiều doanh nghiệp lớn trong và ngoài nước.', 'Lawyer An has over 15 years of experience in business and intellectual property law. He has advised many large domestic and foreign companies.', 'Luật Sư Cao Cấp', 'Senior Partner', 15, 'LS-001234', ARRAY['vi', 'en'], true, '{"monday": {"start": "08:00", "end": "17:00"}, "tuesday": {"start": "08:00", "end": "17:00"}, "wednesday": {"start": "08:00", "end": "17:00"}, "thursday": {"start": "08:00", "end": "17:00"}, "friday": {"start": "08:00", "end": "17:00"}}', NOW(), NOW()),
    ('lv000002-0001-0001-0001-000000000002', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'luat-su-tran-thi-b', 'Trần Thị Bình', 'Tran Thi Binh', 'Luật sư Bình chuyên về luật lao động và giải quyết tranh chấp. Bà có 10 năm kinh nghiệm tư vấn cho cả người lao động và doanh nghiệp.', 'Lawyer Binh specializes in labor law and dispute resolution. She has 10 years of experience advising both employees and businesses.', 'Luật Sư', 'Associate', 10, 'LS-005678', ARRAY['vi', 'en', 'ja'], true, '{"monday": {"start": "09:00", "end": "18:00"}, "tuesday": {"start": "09:00", "end": "18:00"}, "wednesday": {"start": "09:00", "end": "18:00"}, "thursday": {"start": "09:00", "end": "18:00"}, "friday": {"start": "09:00", "end": "18:00"}}', NOW(), NOW());

-- Lawyer Services
INSERT INTO service_lawyers (service_id, lawyer_id, is_primary)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'lv000001-0001-0001-0001-000000000001', true),
    ('55555555-5555-5555-5555-555555555555', 'lv000001-0001-0001-0001-000000000001', true),
    ('77777777-7777-7777-7777-777777777777', 'lv000001-0001-0001-0001-000000000001', true),
    ('11111111-1111-1111-1111-111111111111', 'lv000002-0001-0001-0001-000000000002', true),
    ('66666666-6666-6666-6666-666666666666', 'lv000002-0001-0001-0001-000000000002', true),
    ('33333333-3333-3333-3333-333333333333', 'lv000002-0001-0001-0001-000000000002', false);

-- Lawyer Availability
INSERT INTO lawyer_availability (lawyer_id, day_of_week, start_time, end_time, slot_duration, is_active)
VALUES 
    ('lv000001-0001-0001-0001-000000000001', 1, '08:00', '17:00', 60, true),
    ('lv000001-0001-0001-0001-000000000001', 2, '08:00', '17:00', 60, true),
    ('lv000001-0001-0001-0001-000000000001', 3, '08:00', '17:00', 60, true),
    ('lv000001-0001-0001-0001-000000000001', 4, '08:00', '17:00', 60, true),
    ('lv000001-0001-0001-0001-000000000001', 5, '08:00', '17:00', 60, true),
    ('lv000002-0001-0001-0001-000000000002', 1, '09:00', '18:00', 60, true),
    ('lv000002-0001-0001-0001-000000000002', 2, '09:00', '18:00', 60, true),
    ('lv000002-0001-0001-0001-000000000002', 3, '09:00', '18:00', 60, true),
    ('lv000002-0001-0001-0001-000000000002', 4, '09:00', '18:00', 60, true),
    ('lv000002-0001-0001-0001-000000000002', 5, '09:00', '18:00', 60, true);

-- ============================================================
-- REVIEWS (Đánh Giá)
-- ============================================================
INSERT INTO reviews (id, client_name, client_role, content_vi, content_en, rating, is_featured, is_published, source, created_at)
VALUES 
    ('rv000001-0001-0001-0001-000000000001', 'Ông Hoàng Minh Đức', 'Giám Đốc Công Ty ABC', 'Tôi rất hài lòng với dịch vụ tư vấn pháp lý của LawFirm. Luật sư Nguyễn Văn An đã tư vấn rất chi tiết và giúp công ty tôi giải quyết vấn đề hợp đồng một cách nhanh chóng. Đội ngũ chuyên nghiệp, tận tâm.', 'I am very satisfied with the legal consultation service of LawFirm. Lawyer Nguyen Van An provided very detailed consultation and helped my company resolve contract issues quickly. Professional, dedicated team.', 5, true, true, 'WEBSITE', NOW()),
    ('rv000002-0001-0001-0001-000000000002', 'Bà Nguyễn Thị Hương', 'Chủ Doanh Nghiệp Tư Nhân', 'LawFirm đã hỗ trợ tôi rất nhiều trong việc thành lập doanh nghiệp. Quy trình nhanh gọn, chi phí hợp lý. Đặc biệt, luật sư Bình rất nhiệt tình và giải đáp mọi thắc mắc của tôi 24/7.', 'LawFirm has supported me a lot in establishing my business. The process was quick, reasonable cost. Especially, lawyer Binh was very enthusiastic and answered all my questions 24/7.', 5, true, true, 'WEBSITE', NOW()),
    ('rv000003-0001-0001-0001-000000000003', 'Anh Lê Văn Tuấn', 'Nhân Viên Văn Phòng', 'Cảm ơn LawFirm đã giúp tôi giải quyết tranh chấp lao động với công ty cũ. Tôi đã được bảo vệ quyền lợi một cách công bằng. Dịch vụ xuất sắc!', 'Thank you LawFirm for helping me resolve labor disputes with my former company. My rights were protected fairly. Excellent service!', 5, true, true, 'WEBSITE', NOW());

-- ============================================================
-- CATEGORIES (Danh Mục Bài Viết)
-- ============================================================
INSERT INTO categories (id, slug, meta_title_vi, meta_title_en, meta_desc_vi, meta_desc_en, display_order, created_at, updated_at, created_by)
VALUES 
    ('ct000001-0001-0001-0001-000000000001', 'tin-tuc-phap-luat', 'Tin Tức Pháp Luật', 'Legal News', 'Cập nhật tin tức pháp luật mới nhất', 'Latest legal news updates', 1, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('ct000002-0001-0001-0001-000000000002', 'huong-dan-thu-tuc', 'Hướng Dẫn Thủ Tục', 'Procedures Guide', 'Hướng dẫn các thủ tục pháp lý', 'Guide to legal procedures', 2, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('ct000003-0001-0001-0001-000000000003', 'kien-thuc-phap-ly', 'Kiến Thức Pháp Lý', 'Legal Knowledge', 'Chia sẻ kiến thức pháp lý hữu ích', 'Share useful legal knowledge', 3, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('ct000004-0001-0001-0001-000000000004', 'tu-van-c Dieu-khien', 'Tư Vấn Cộng Đồng', 'Community Advice', 'Giải đáp thắc mắc pháp lý cộng đồng', 'Community legal Q&A', 4, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- ============================================================
-- TAGS
-- ============================================================
INSERT INTO tags (id, slug, created_at, updated_at, created_by)
VALUES 
    ('tg000001-0001-0001-0001-000000000001', 'luat-kinh-doanh', NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('tg000002-0001-0001-0001-000000000002', 'luat-laO-dong', NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('tg000003-0001-0001-0001-000000000003', 'so-huu-tri-tue', NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('tg000004-0001-0001-0001-000000000004', 'thue-thu-nhap', NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('tg000005-0001-0001-0001-000000000005', 'cong-no', NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('tg000006-0001-0001-0001-000000000006', 'hop-dong', NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- ============================================================
-- NEWSLETTER SUBSCRIBERS (Sample)
-- ============================================================
INSERT INTO newsletter_subscribers (id, email, name, status, verified_at, source, created_at)
VALUES 
    ('ns000001-0001-0001-0001-000000000001', 'contact@company1.vn', 'Công Ty ABC', 'VERIFIED', NOW(), 'WEBSITE', NOW()),
    ('ns000002-0001-0001-0001-000000000002', 'info@company2.vn', 'Công Ty XYZ', 'VERIFIED', NOW(), 'WEBSITE', NOW());

-- ============================================================
-- JOB POSTINGS (Sample)
-- ============================================================
INSERT INTO job_postings (id, title, title_en, department, location, job_type, description_vi, description_en, requirements_vi, requirements_en, salary_range, status, deadline, created_at, updated_at)
VALUES 
    ('jp000001-0001-0001-0001-000000000001', 
     'Tuyển Dụng Luật Sư Thực Tập', 
     'Recruiting Junior Lawyer',
     'Pháp Chế',
     'Hồ Chí Minh',
     'FULL_TIME',
     'Chúng tôi đang tìm kiếm ứng viên xuất sắc cho vị trí Luật sư thực tập. Đây là cơ hội tuyệt vời để phát triển sự nghiệp trong môi trường chuyên nghiệp.',
     'We are looking for outstanding candidates for the Junior Lawyer position. This is a great opportunity to develop your career in a professional environment.',
     '- Tốt nghiệp Luật từ Đại học Quốc gia hoặc tương đương\n- Có chứng chỉ hành nghề luật sư là điểm cộng\n- Kỹ năng nghiên cứu và viết lách tốt\n- Năng động, có trách nhiệm',
     '- Graduated in Law from National University or equivalent\n- Having a lawyer practice certificate is a plus\n- Good research and writing skills\n- Energetic, responsible',
     '15-25 triệu VNĐ/tháng',
     'PUBLISHED',
     '2026-06-30',
     NOW(),
     NOW());
