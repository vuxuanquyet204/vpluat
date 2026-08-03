-- ============================================================
-- V19__seed_additional_faqs.sql
-- Seed additional FAQs for better homepage content
-- ============================================================

DO $$
DECLARE
    consult_service_id UUID;
    labor_service_id UUID;
    ip_service_id UUID;
    faq1_id UUID;
    faq2_id UUID;
    faq3_id UUID;
    faq4_id UUID;
    faq5_id UUID;
    faq6_id UUID;
BEGIN
    -- Get service IDs
    SELECT id INTO consult_service_id FROM services WHERE slug = 'tu-van-phap-ly' LIMIT 1;
    SELECT id INTO labor_service_id FROM services WHERE slug = 'lao-dong' LIMIT 1;
    SELECT id INTO ip_service_id FROM services WHERE slug = 'so-huu-tri-tue' LIMIT 1;

    -- Insert FAQ 1: Giấy tờ cần chuẩn bị (consult)
    INSERT INTO faqs (id, service_id, display_order, is_published, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), consult_service_id, 2, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    ON CONFLICT DO NOTHING
    RETURNING id INTO faq1_id;

    -- Insert FAQ 2: Thanh toán (consult)
    INSERT INTO faqs (id, service_id, display_order, is_published, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), consult_service_id, 3, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    ON CONFLICT DO NOTHING
    RETURNING id INTO faq2_id;

    -- Insert FAQ 3: Lao động
    INSERT INTO faqs (id, service_id, display_order, is_published, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), labor_service_id, 1, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    ON CONFLICT DO NOTHING
    RETURNING id INTO faq3_id;

    -- Insert FAQ 4: Sở hữu trí tuệ
    INSERT INTO faqs (id, service_id, display_order, is_published, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), ip_service_id, 1, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    ON CONFLICT DO NOTHING
    RETURNING id INTO faq4_id;

    -- Insert locale_keys for FAQ 1 (only if not exists)
    IF NOT EXISTS (SELECT 1 FROM locale_keys WHERE entity_type = 'faqs' AND entity_id = faq1_id AND locale = 'vi') THEN
        INSERT INTO locale_keys (entity_type, entity_id, locale, title, content)
        VALUES ('faqs', faq1_id, 'vi', 'Tôi cần chuẩn bị những gì khi đến tư vấn lần đầu?',
                'Khi đến tư vấn lần đầu, bạn nên mang theo các giấy tờ liên quan đến vụ việc như hợp đồng, quyết định, thông báo từ cơ quan nhà nước. Đội ngũ VP Luật sẽ hướng dẫn chi tiết qua điện thoại trước buổi tư vấn.');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM locale_keys WHERE entity_type = 'faqs' AND entity_id = faq1_id AND locale = 'en') THEN
        INSERT INTO locale_keys (entity_type, entity_id, locale, title, content)
        VALUES ('faqs', faq1_id, 'en', 'What should I prepare for the first consultation?',
                'For the first consultation, you should bring relevant documents such as contracts, decisions, and notifications from government agencies. VP Law team will guide you in detail by phone before the consultation.');
    END IF;

    -- Insert locale_keys for FAQ 2
    IF NOT EXISTS (SELECT 1 FROM locale_keys WHERE entity_type = 'faqs' AND entity_id = faq2_id AND locale = 'vi') THEN
        INSERT INTO locale_keys (entity_type, entity_id, locale, title, content)
        VALUES ('faqs', faq2_id, 'vi', 'Tôi có thể thanh toán phí dịch vụ bằng cách nào?',
                'VP Luật chấp nhận thanh toán qua chuyển khoản ngân hàng, tiền mặt tại văn phòng. Đối với các vụ việc lớn, chúng tôi có chính sách thanh toán theo giai đoạn.');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM locale_keys WHERE entity_type = 'faqs' AND entity_id = faq2_id AND locale = 'en') THEN
        INSERT INTO locale_keys (entity_type, entity_id, locale, title, content)
        VALUES ('faqs', faq2_id, 'en', 'How can I pay for legal services?',
                'VP Law accepts payments via bank transfer, cash at office. For large cases, we offer installment payment plans.');
    END IF;

    -- Insert locale_keys for FAQ 3
    IF NOT EXISTS (SELECT 1 FROM locale_keys WHERE entity_type = 'faqs' AND entity_id = faq3_id AND locale = 'vi') THEN
        INSERT INTO locale_keys (entity_type, entity_id, locale, title, content)
        VALUES ('faqs', faq3_id, 'vi', 'Quyền lợi của người lao động khi bị sa thải trái pháp luật?',
                'Người lao động bị sa thải trái pháp luật có quyền yêu cầu khôi phục việc làm, tiền lương trong thời gian chưa làm việc và bồi thường.');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM locale_keys WHERE entity_type = 'faqs' AND entity_id = faq3_id AND locale = 'en') THEN
        INSERT INTO locale_keys (entity_type, entity_id, locale, title, content)
        VALUES ('faqs', faq3_id, 'en', 'What are the rights of employees when wrongfully terminated?',
                'Employees wrongfully terminated have the right to request reinstatement, unpaid wages during suspension, and compensation.');
    END IF;

    -- Insert locale_keys for FAQ 4
    IF NOT EXISTS (SELECT 1 FROM locale_keys WHERE entity_type = 'faqs' AND entity_id = faq4_id AND locale = 'vi') THEN
        INSERT INTO locale_keys (entity_type, entity_id, locale, title, content)
        VALUES ('faqs', faq4_id, 'vi', 'Làm thế nào để bảo hộ nhãn hiệu cho doanh nghiệp?',
                'Để bảo hộ nhãn hiệu, doanh nghiệp cần nộp đơn đăng ký tại Cục Sở hữu trí tuệ. Thời gian xử lý thường từ 12-18 tháng.');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM locale_keys WHERE entity_type = 'faqs' AND entity_id = faq4_id AND locale = 'en') THEN
        INSERT INTO locale_keys (entity_type, entity_id, locale, title, content)
        VALUES ('faqs', faq4_id, 'en', 'How to protect trademarks for businesses?',
                'To protect trademarks, businesses need to file registration applications with the Intellectual Property Office. Processing time is usually 12-18 months.');
    END IF;

    RAISE NOTICE 'V19__seed_additional_faqs completed successfully';
END $$;
