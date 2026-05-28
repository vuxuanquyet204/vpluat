-- ============================================================
-- V4__seed_services.sql
-- BRS v2.0 - Additional Services Seed Data
-- ============================================================

-- ============================================================
-- Service Translations (Additional)
-- ============================================================
-- Adding more detailed content for services

UPDATE locale_keys 
SET content = 'Dịch vụ tư vấn pháp lý của chúng tôi bao gồm:

1. **Tư vấn pháp lý thường xuyên**: Cung cấp dịch vụ tư vấn pháp lý cho doanh nghiệp và cá nhân về các vấn đề pháp lý hàng ngày.

2. **Tư vấn hợp đồng**: Rà soát, soạn thảo và đàm phán các loại hợp đồng thương mại, lao động, bất động sản...

3. **Tư vấn giải quyết tranh chấp**: Hỗ trợ giải quyết tranh chấp thông qua thương lượng, hòa giải hoặc kiện tụng.

4. **Tư vấn tuân thủ pháp luật**: Đảm bảo doanh nghiệp hoạt động tuân thủ các quy định pháp luật hiện hành.

**Ưu điểm dịch vụ:**
- Đội ngũ luật sư giàu kinh nghiệm
- Phản hồi nhanh chóng trong 24h
- Bảo mật thông tin tuyệt đối
- Chi phí hợp lý, minh bạch'
WHERE entity_type = 'services' 
AND entity_id = '11111111-1111-1111-1111-111111111111' 
AND locale = 'vi';

UPDATE locale_keys 
SET content = 'Our legal consultation services include:

1. **Regular Legal Consultation**: Providing legal consultation services for businesses and individuals on daily legal issues.

2. **Contract Consultation**: Reviewing, drafting, and negotiating various types of commercial, labor, and real estate contracts...

3. **Dispute Resolution Consultation**: Supporting dispute resolution through negotiation, mediation, or litigation.

4. **Legal Compliance Consultation**: Ensuring businesses operate in compliance with current laws and regulations.

**Service Advantages:**
- Experienced team of lawyers
- Quick response within 24 hours
- Absolute confidentiality
- Reasonable, transparent costs'
WHERE entity_type = 'services' 
AND entity_id = '11111111-1111-1111-1111-111111111111' 
AND locale = 'en';

-- ============================================================
-- Additional FAQs
-- ============================================================
INSERT INTO faqs (id, service_id, display_order, is_published, created_at, updated_at, created_by)
VALUES 
    ('fa000006-0001-0001-0001-000000000006', '22222222-2222-2222-2222-222222222222', 2, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('fa000007-0001-0001-0001-000000000007', '77777777-7777-7777-7777-777777777777', 1, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('fa000008-0001-0001-0001-000000000008', '88888888-8888-8888-8888-888888888888', 1, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

INSERT INTO locale_keys (entity_type, entity_id, locale, title, content)
VALUES 
    ('faqs', 'fa000006-0001-0001-0001-000000000006', 'vi', 'Phí đại diện pháp lý được tính như thế nào?', 'Phí đại diện pháp lý được tính dựa trên: (1) Mức độ phức tạp của vụ việc, (2) Thời gian và công sức của luật sư, (3) Kinh nghiệm của luật sư. Chúng tôi sẽ báo giá chi tiết sau khi nghiên cứu hồ sơ.'),
    ('faqs', 'fa000006-0001-0001-0001-000000000006', 'en', 'How are legal representation fees calculated?', 'Legal representation fees are calculated based on: (1) Complexity of the case, (2) Time and effort of the lawyer, (3) Lawyer experience. We will provide detailed pricing after reviewing the case.'),
    ('faqs', 'fa000007-0001-0001-0001-000000000007', 'vi', 'Thành lập công ty mất bao lâu?', 'Thời gian thành lập công ty phụ thuộc vào loại hình doanh nghiệp: (1) Công ty TNHH 1 thành viên: 3-5 ngày làm việc, (2) Công ty TNHH 2 thành viên trở lên: 5-7 ngày làm việc, (3) Công ty cổ phần: 7-10 ngày làm việc.'),
    ('faqs', 'fa000007-0001-0001-0001-000000000007', 'en', 'How long does it take to establish a company?', 'The time to establish a company depends on the type: (1) Single-member LLC: 3-5 working days, (2) Multi-member LLC: 5-7 working days, (3) Joint-stock company: 7-10 working days.'),
    ('faqs', 'fa000008-0001-0001-0001-000000000008', 'vi', 'Làm thế nào để chuyển nhượng bất động sản an toàn?', 'Để chuyển nhượng bất động sản an toàn, bạn nên: (1) Kiểm tra pháp lý kỹ lưỡng, (2) Xác minh quyền sở hữu, (3) Thanh toán qua ngân hàng, (4) Công chứng hợp đồng tại văn phòng công chứng uy tín, (5) Đăng bộ sang tên chính chủ.'),
    ('faqs', 'fa000008-0001-0001-0001-000000000008', 'en', 'How to safely transfer real estate?', 'To safely transfer real estate, you should: (1) Conduct thorough legal checks, (2) Verify ownership, (3) Pay through bank, (4) Notarize the contract at a reputable notary office, (5) Register the name transfer officially.');

-- ============================================================
-- Additional Case Studies Template
-- ============================================================
INSERT INTO case_studies (id, slug, outcome, is_featured, is_published, created_at, updated_at, created_by)
VALUES 
    ('cs000001-0001-0001-0001-000000000001', 'tu-van-thanh-lap-cong-ty-abc', 'Thành lập thành công công ty TNHH với vốn điều lệ 10 tỷ VNĐ trong 7 ngày làm việc', true, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('cs000002-0001-0001-0001-000000000002', 'giai-quyet-tranh-chap-hop-dong', 'Thương lượng thành công, giải quyết tranh chấp hợp đồng với giá trị 5 tỷ VNĐ mà không cần kiện tụng', true, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

INSERT INTO case_study_services (case_study_id, service_id)
VALUES 
    ('cs000001-0001-0001-0001-000000000001', '77777777-7777-7777-7777-777777777777'),
    ('cs000002-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111');

INSERT INTO locale_keys (entity_type, entity_id, locale, title, excerpt, content, meta_title, meta_desc)
VALUES 
    ('case_studies', 'cs000001-0001-0001-0001-000000000001', 'vi', 'Tư Vấn Thành Lập Công Ty ABC', 'Công ty TNHH ABC được thành lập thành công với sự hỗ trợ của LawFirm', '**Thử thách:** Khách hàng cần thành lập công ty TNHH với vốn điều lệ 10 tỷ VNĐ trong thời gian ngắn nhất.\n\n**Giải pháp:** Đội ngũ LawFirm đã:\n1. Tư vấn cấu trúc công ty phù hợp\n2. Soạn thảo điều lệ công ty\n3. Hoàn thiện hồ sơ đăng ký kinh doanh\n4. Đại diện nộp hồ sơ và theo dõi tiến độ\n5. Hoàn tất các thủ tục sau đăng ký\n\n**Kết quả:** Công ty được thành lập thành công trong 7 ngày làm việc, đảm bảo mọi yêu cầu pháp lý.', 'Tư Vấn Thành Lập Công Ty ABC - LawFirm', 'LawFirm tư vấn thành lập công ty ABC thành công với vốn 10 tỷ VNĐ'),
    ('case_studies', 'cs000001-0001-0001-0001-000000000001', 'en', 'Legal Consultation for ABC Company Establishment', 'ABC LLC successfully established with LawFirm support', '**Challenge:** Customer needed to establish an LLC with registered capital of 10 billion VND in the shortest time possible.\n\n**Solution:** LawFirm team:\n1. Advised on suitable company structure\n2. Drafted company charter\n3. Completed business registration documents\n4. Represented submission and monitored progress\n5. Completed post-registration procedures\n\n**Result:** Company successfully established in 7 working days, ensuring all legal requirements.', 'Legal Consultation for ABC Company - LawFirm', 'LawFirm successfully consulted ABC company establishment with 10 billion VND capital'),
    ('case_studies', 'cs000002-0001-0001-0001-000000000002', 'vi', 'Giải Quyết Tranh Chấp Hợp Đồng Thương Mại', 'Thương lượng thành công tranh chấp hợp đồng trị giá 5 tỷ VNĐ', '**Thử thách:** Hai doanh nghiệp có tranh chấp về hợp đồng cung cấp dịch vụ trị giá 5 tỷ VNĐ.\n\n**Giải pháp:** Thay vì kiện tụng kéo dài, LawFirm đề xuất:\n1. Phân tích chi tiết hợp đồng và các điều khoản\n2. Xác định lợi ích chung của hai bên\n3. Tổ chức buổi thương lượng có trọng tài\n4. Soạn thảo phương án giải quyết hài hòa\n5. Lập biên bản thỏa thuận có công chứng\n\n**Kết quả:** Hai bên đạt được thỏa thuận trong 2 tuần, tiết kiệm chi phí pháp lý và duy trì quan hệ kinh doanh.', 'Giải Quyết Tranh Chấp Hợp Đồng - LawFirm', 'LawFirm giải quyết tranh chấp hợp đồng 5 tỷ VNĐ bằng thương lượng'),
    ('case_studies', 'cs000002-0001-0001-0001-000000000002', 'en', 'Commercial Contract Dispute Resolution', 'Successfully negotiated commercial contract dispute worth 5 billion VND', '**Challenge:** Two businesses had a dispute over a service supply contract worth 5 billion VND.\n\n**Solution:** Instead of lengthy litigation, LawFirm proposed:\n1. Detailed analysis of the contract and terms\n2. Identifying common interests of both parties\n3. Organizing negotiation session with mediator\n4. Drafting a harmonious resolution\n5. Creating a notarized agreement\n\n**Result:** Both parties reached an agreement within 2 weeks, saving legal costs and maintaining business relationship.', 'Contract Dispute Resolution - LawFirm', 'LawFirm resolved 5 billion VND contract dispute through negotiation');
