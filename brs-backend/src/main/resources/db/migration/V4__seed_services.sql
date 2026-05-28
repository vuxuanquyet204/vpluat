-- ============================================================
-- V4__seed_services.sql
-- BRS v2.0 - Additional Services Seed Data
-- ============================================================

-- ============================================================
-- Additional FAQs (selecting from existing services)
-- ============================================================
DO $$
DECLARE
    rep_service_id UUID;
    corp_service_id UUID;
    real_service_id UUID;
    faq1_id UUID;
    faq2_id UUID;
    faq3_id UUID;
BEGIN
    -- Get service IDs
    SELECT id INTO rep_service_id FROM services WHERE slug = 'dai-dien-phap-ly' LIMIT 1;
    SELECT id INTO corp_service_id FROM services WHERE slug = 'doanh-nghiep' LIMIT 1;
    SELECT id INTO real_service_id FROM services WHERE slug = 'nha-dat' LIMIT 1;

    -- Insert FAQs
    INSERT INTO faqs (id, service_id, display_order, is_published, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), rep_service_id, 2, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    RETURNING id INTO faq1_id;

    INSERT INTO faqs (id, service_id, display_order, is_published, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), corp_service_id, 1, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    RETURNING id INTO faq2_id;

    INSERT INTO faqs (id, service_id, display_order, is_published, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), real_service_id, 1, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    RETURNING id INTO faq3_id;

    -- Insert FAQ translations
    INSERT INTO locale_keys (entity_type, entity_id, locale, title, content) VALUES
        ('faqs', faq1_id, 'vi', 'Phí đại diện pháp lý được tính như thế nào?',
         'Phí đại diện pháp lý được tính dựa trên mức độ phức tạp của vụ việc và thời gian của luật sư.'),
        ('faqs', faq1_id, 'en', 'How are legal representation fees calculated?',
         'Legal representation fees are calculated based on the complexity of the case and the time spent by the lawyer.'),
        ('faqs', faq2_id, 'vi', 'Thành lập công ty mất bao lâu?',
         'Thời gian thành lập công ty phụ thuộc vào loại hình: 3-10 ngày làm việc.'),
        ('faqs', faq2_id, 'en', 'How long does it take to establish a company?',
         'The time depends on the business type: 3-10 working days.'),
        ('faqs', faq3_id, 'vi', 'Làm thế nào để chuyển nhượng bất động sản an toàn?',
         'Để chuyển nhượng an toàn, cần kiểm tra pháp lý, xác minh quyền sở hữu và thanh toán qua ngân hàng.'),
        ('faqs', faq3_id, 'en', 'How to safely transfer real estate?',
         'For safe transfer, check legal status, verify ownership, and pay through bank.');
END $$;

-- ============================================================
-- Additional Case Studies
-- ============================================================
DO $$
DECLARE
    corp_service_id UUID;
    consult_service_id UUID;
    cs1_id UUID;
    cs2_id UUID;
BEGIN
    SELECT id INTO corp_service_id FROM services WHERE slug = 'doanh-nghiep' LIMIT 1;
    SELECT id INTO consult_service_id FROM services WHERE slug = 'tu-van-phap-ly' LIMIT 1;

    INSERT INTO case_studies (id, slug, outcome, is_featured, is_published, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), 'tu-van-thanh-lap-cong-ty-abc',
            'Thành lập thành công công ty TNHH với vốn điều lệ 10 tỷ VNĐ trong 7 ngày làm việc',
            true, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    RETURNING id INTO cs1_id;

    INSERT INTO case_studies (id, slug, outcome, is_featured, is_published, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), 'giai-quyet-tranh-chap-hop-dong',
            'Thương lượng thành công, giải quyết tranh chấp hợp đồng với giá trị 5 tỷ VNĐ mà không cần kiện tụng',
            true, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    RETURNING id INTO cs2_id;

    INSERT INTO case_study_services (case_study_id, service_id)
    VALUES (cs1_id, corp_service_id), (cs2_id, consult_service_id);

    INSERT INTO locale_keys (entity_type, entity_id, locale, title, excerpt)
    VALUES
        ('case_studies', cs1_id, 'vi', 'Tư Vấn Thành Lập Công Ty ABC',
         'Công ty TNHH ABC được thành lập thành công với sự hỗ trợ của LawFirm'),
        ('case_studies', cs1_id, 'en', 'Legal Consultation for ABC Company',
         'ABC LLC successfully established with LawFirm support'),
        ('case_studies', cs2_id, 'vi', 'Giải Quyết Tranh Chấp Hợp Đồng',
         'Thương lượng thành công tranh chấp hợp đồng trị giá 5 tỷ VNĐ'),
        ('case_studies', cs2_id, 'en', 'Commercial Contract Dispute Resolution',
         'Successfully negotiated commercial contract dispute worth 5 billion VND');
END $$;
