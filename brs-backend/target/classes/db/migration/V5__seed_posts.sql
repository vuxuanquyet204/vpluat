-- ============================================================
-- V5__seed_posts.sql
-- BRS v2.0 - Posts/Blog Seed Data
-- ============================================================

-- ============================================================
-- Sample Blog Posts
-- ============================================================
INSERT INTO posts (id, slug, thumbnail_url, author_id, category_id, status, published_at, views, reading_time, is_featured, language, created_at, updated_at, created_by)
VALUES 
    ('po000001-0001-0001-0001-000000000001', '10-dieu-doanh-nghiep-can-biet-ve-hop-dong-laO-dong', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'ct000002-0001-0001-0001-000000000002', 'PUBLISHED', NOW() - INTERVAL '7 days', 1250, 8, true, 'vi', NOW(), NOW(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
    ('po000002-0001-0001-0001-000000000002', 'huong-dan-dang-ky-so-huu-tri-tue-nhanh-chong', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'ct000002-0001-0001-0001-000000000002', 'PUBLISHED', NOW() - INTERVAL '14 days', 890, 12, true, 'vi', NOW(), NOW(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
    ('po000003-0001-0001-0001-000000000003', 'thue-thu-nhap-ca-nhan-2026-nhung-dieu-moi', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'ct000001-0001-0001-0001-000000000001', 'PUBLISHED', NOW() - INTERVAL '3 days', 2100, 10, true, 'vi', NOW(), NOW(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
    ('po000004-0001-0001-0001-000000000004', 'quyen-loi-khi-thanh-lap-doanh-nghiep-trong-nam-2026', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'ct000001-0001-0001-0001-000000000001', 'PUBLISHED', NOW() - INTERVAL '5 days', 780, 6, false, 'vi', NOW(), NOW(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
    ('po000005-0001-0001-0001-000000000005', '5-sai-lam-thuong-gap-khi-ky-hop-dong', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'ct000003-0001-0001-0001-000000000003', 'PUBLISHED', NOW() - INTERVAL '10 days', 1560, 7, false, 'vi', NOW(), NOW(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
    ('po000006-0001-0001-0001-000000000006', 'understanding-vietnamese-business-law', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'ct000001-0001-0001-0001-000000000001', 'PUBLISHED', NOW() - INTERVAL '7 days', 450, 8, false, 'en', NOW(), NOW(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');

-- Post Translations (Vietnamese)
INSERT INTO locale_keys (entity_type, entity_id, locale, title, excerpt, content, meta_title, meta_desc)
VALUES 
    ('posts', 'po000001-0001-0001-0001-000000000001', 'vi', 
     '10 Điều Doanh Nghiệp Cần Biết Về Hợp Đồng Lao Động', 
     'Hợp đồng lao động là văn bản quan trọng giữa người sử dụng lao động và người lao động. Dưới đây là 10 điều cần lưu ý.',
     '## 1. Hợp đồng lao động phải được lập bằng văn bản

Theo Bộ luật Lao động 2019, hợp đồng lao động phải được giao kết bằng văn bản cho các trường hợp:
- Hợp đồng lao động có thời hạn từ 12 tháng trở lên
- Hợp đồng lao động không xác định thời hạn
- Hợp đồng lao động cho người giúp việc gia đình

## 2. Các loại hợp đồng lao động

Có 3 loại hợp đồng lao động:
1. Hợp đồng lao động không xác định thời hạn
2. Hợp đồng lao động xác định thời hạn
3. Hợp đồng lao động theo mùa vụ hoặc theo công việc nhất định

## 3. Thời hạn hợp đồng

- Hợp đồng xác định thời hạn: tối đa 36 tháng
- Hợp đồng mùa vụ/công việc nhất định: dưới 12 tháng

## 4. Nội dung bắt buộc của hợp đồng

Hợp đồng lao động phải có các nội dung chính:
- Thông tin về người sử dụng lao động
- Thông tin về người lao động
- Công việc và địa điểm làm việc
- Thời hạn hợp đồng
- Mức lương, phụ cấp, cách thức trả lương
- Thời giờ làm việc, thời giờ nghỉ ngơi
- Trang bị bảo hộ lao động

## 5. Lương và cách trả lương

- Tiền lương không được thấp hơn mức lương tối thiểu vùng
- Trả lương ít nhất 1 lần/tháng hoặc theo thỏa thuận
- Người lao động được trả lương khi nghỉ phép năm

## 6. Thời giờ làm việc

- Không quá 8 giờ/ngày và 48 giờ/tuần
- Làm thêm giờ không quá 4 giờ/ngày
- Tổng thời gian làm thêm không quá 200 giờ/năm

## 7. Nghỉ phép năm

Người lao động được hưởng:
- 12 ngày phép năm với người làm việc trong điều kiện bình thường
- 14 ngày với người làm việc trong điều kiện nặng nhọc, độc hại

## 8. Chấm dứt hợp đồng lao động

Hợp đồng lao động có thể chấm dứt trong các trường hợp:
- Hai bên thỏa thuận
- Hết hạn hợp đồng
- Hoàn thành công việc
- Đơn phương chấm dứt với lý do hợp pháp
- Người lao động bị kết án phạt tù

## 9. Trách nhiệm khi đơn phương chấm dứt

Người lao động đơn phương chấm dứt trái phép sẽ phải:
- Bồi thường cho người sử dụng lao động
- Không được trợ cấp thôi việc

Người sử dụng lao động đơn phương chấm dứt trái phép sẽ phải:
- Nhận lại người lao động và trả lương
- Bồi thường và tiền trợ cấp thôi việc

## 10. Lưu ý quan trọng

- Lưu giữ hợp đồng lao động cẩn thận
- Thông báo trước khi chấm dứt hợp đồng
- Thực hiện đúng các nghĩa vụ với người lao động
- Tham khảo ý kiến luật sư khi cần thiết',
     '10 Điều Doanh Nghiệp Cần Biết Về Hợp Đồng Lao Động | LawFirm',
     'Hướng dẫn chi tiết 10 điều doanh nghiệp cần biết về hợp đồng lao động theo Bộ luật Lao động 2019'),

    ('posts', 'po000002-0001-0001-0001-000000000002', 'vi',
     'Hướng Dẫn Đăng Ký Sở Hữu Trí Tuệ Nhanh Chóng',
     'Sở hữu trí tuệ là tài sản quý giá của doanh nghiệp. Bài viết này hướng dẫn cách đăng ký bảo hộ nhanh chóng.',
     '## Tại sao cần đăng ký sở hữu trí tuệ?

Sở hữu trí tuệ (SHTT) bao gồm:
- Sáng chế, giải pháp hữu ích
- Kiểu dáng công nghiệp
- Nhãn hiệu, thương hiệu
- Bản quyền tác phẩm
- bí quyết công nghệ (trade secrets)

## Quy trình đăng ký nhãn hiệu

### Bước 1: Tra cứu nhãn hiệu
Trước khi đăng ký, cần tra cứu để đảm bảo nhãn hiệu không trùng lặp với nhãn hiệu đã đăng ký.

### Bước 2: Chuẩn bị hồ sơ
Hồ sơ đăng ký nhãn hiệu bao gồm:
- Đơn đăng ký nhãn hiệu (theo mẫu)
- Mẫu nhãn hiệu (8x8cm hoặc 10x10cm)
- Danh mục sản phẩm/dịch vụ mang nhãn hiệu
- Chứng từ nộp phí

### Bước 3: Nộp hồ sơ
Nộp tại Cục Sở hữu trí tuệ hoặc qua hệ thống trực tuyến.

### Bước 4: Theo dõi và xử lý
- Thẩm định hình thức: 1-2 tháng
- Công bố đơn: 2 tháng
- Thẩm định nội dung: 9-12 tháng
- Cấp văn bằng: 2-4 tháng

## Thời hạn bảo hộ
- Nhãn hiệu: 10 năm, gia hạn 10 năm/lần
- Sáng chế: 20 năm
- Kiểu dáng công nghiệp: 15 năm

## Lưu ý quan trọng
- Nên đăng ký sớm để tránh bị đăng ký trước
- Theo dõi và gia hạn đúng hạn
- Bảo vệ quyền SHTT của doanh nghiệp',
     'Hướng Dẫn Đăng Ký Sở Hữu Trí Tuệ | LawFirm',
     'Hướng dẫn chi tiết quy trình đăng ký sở hữu trí tuệ, nhãn hiệu, sáng chế nhanh chóng tại Việt Nam'),

    ('posts', 'po000003-0001-0001-0001-000000000003', 'vi',
     'Thuế Thu Nhập Cá Nhân 2026: Những Điều Mới Cần Biết',
     'Năm 2026 có nhiều thay đổi về thuế thu nhập cá nhân. Cập nhật ngay để tránh vi phạm.',
     '## Các khoản thu nhập chịu thuế TNCN

1. Thu nhập từ tiền lương, tiền công
2. Thu nhập từ kinh doanh
3. Thu nhập từ đầu tư vốn
4. Thu nhập từ chuyển nhượng vốn
5. Thu nhập từ chuyển nhượng bất động sản
6. Thu nhập từ trúng thưởng, quà tặng

## Thuế suất áp dụng

### Đối với thu nhập từ tiền lương, tiền công:
| Bậc | Thu nhập tính thuế/tháng | Thuế suất |
|-----|--------------------------|-----------|
| 1 | Đến 5 triệu | 5% |
| 2 | Trên 5 - 10 triệu | 10% |
| 3 | Trên 10 - 18 triệu | 15% |
| 4 | Trên 18 - 32 triệu | 20% |
| 5 | Trên 32 - 52 triệu | 25% |
| 6 | Trên 52 - 80 triệu | 30% |
| 7 | Trên 80 triệu | 35% |

## Giảm trừ gia cảnh

### Người phụ thuộc
- Mức giảm trừ: 4,4 triệu đồng/tháng/người
- Điều kiện: người phụ thuộc không có thu nhập hoặc thu nhập không vượt quá giảm trừ gia cảnh

### Người nộp thuế
- Mức giảm trừ bản thân: 11 triệu đồng/tháng

## Những thay đổi nổi bật 2026
1. Tăng mức giảm trừ gia cảnh
2. Đơn giản hóa quy trình khai thuế
3. Mở rộng ứng dụng công nghệ trong quản lý thuế',
     'Thuế Thu Nhập Cá Nhân 2026: Những Điều Mới | LawFirm',
     'Cập nhật thuế thu nhập cá nhân 2026: biểu thuế, giảm trừ gia cảnh, và những thay đổi quan trọng'),

    ('posts', 'po000004-0001-0001-0001-000000000004', 'vi',
     '5 Quyền Lợi Khi Thành Lập Doanh Nghiệp Trong Năm 2026',
     'Năm 2026 mang đến nhiều ưu đãi cho doanh nghiệp mới thành lập. Khám phá ngay!',
     '## 1. Ưu đãi về thuế

- Miễn phí thuế môn bài năm đầu cho doanh nghiệp nhỏ
- Giảm 30% thuế thu nhập doanh nghiệp trong 2 năm đầu
- Ưu đãi thuế TNCN cho người khởi nghiệp

## 2. Hỗ trợ về vốn

- Quỹ hỗ trợ SME với lãi suất ưu đãi
- Chương trình vốn vay ưu đãi từ các ngân hàng
- Hỗ trợ tiếp cận nguồn vốn đầu tư

## 3. Ưu đãi về mặt bằng

- Miễn/giảm tiền thuê đất trong khu công nghiệp
- Hỗ trợ thuê văn phòng tại các tòa nhà chính phủ
- Ưu đãi thuê mặt bằng tại các vùng kinh tế-xã hội

## 4. Hỗ trợ tư vấn pháp lý

- Dịch vụ tư vấn miễn phí cho startup
- Hỗ trợ đào tạo pháp luật cho doanh nghiệp
- Cập nhật chính sách pháp luật thường xuyên

## 5. Ưu đãi về thủ tục hành chính

- Đăng ký kinh doanh online 24/7
- Cấp phép nhanh trong 3 ngày làm việc
- Một cửa liên thông các thủ tục',
     '5 Quyền Lợi Khi Thành Lập Doanh Nghiệp 2026 | LawFirm',
     'Khám phá 5 quyền lợi và ưu đãi hấp dẫn khi thành lập doanh nghiệp trong năm 2026'),

    ('posts', 'po000005-0001-0001-0001-000000000005', 'vi',
     '5 Sai Lầm Thường Gặp Khi Ký Kết Hợp Đồng',
     'Ký kết hợp đồng là bước quan trọng trong kinh doanh. Những sai lầm này có thể gây thiệt hại lớn.',
     '## Sai lầm 1: Không đọc kỹ điều khoản

Nhiều doanh nghiệp ký hợp đồng mà không đọc hết các điều khoản. Hậu quả:
- Bị ràng buộc bởi các điều khoản bất lợi
- Không biết các điều khoản phạt vi phạm
- Gặp rủi ro khi xảy ra tranh chấp

## Sai lầm 2: Không xác định rõ phạm vi công việc

Hợp đồng mơ hồ về phạm vi dễ dẫn đến:
- Tranh cãi về nội dung công việc
- Phát sinh chi phí không lường trước
- Chậm tiến độ do hiểu nhầm

## Sai lầm 3: Bỏ qua điều khoản giải quyết tranh chấp

Nhiều hợp đồng không có điều khoản này, dẫn đến:
- Không biết nên giải quyết ở đâu khi xảy ra tranh chấp
- Tốn kém chi phí kiện tụng
- Kéo dài thời gian giải quyết

## Sai lầm 4: Không có điều khoản về bất khả kháng

Thiên tai, dịch bệnh có thể ảnh hưởng đến việc thực hiện hợp đồng. Không có điều khoản này sẽ:
- Không có cơ sở miễn trách
- Phải chịu phạt vi phạm không công bằng

## Sai lầm 5: Không liệt kê đầy đủ các bên liên quan

Hợp đồng thiếu thông tin về:
- Người đại diện theo pháp luật
- Người được ủy quyền ký hợp đồng
- Bên thứ ba liên quan

## Cách tránh những sai lầm này

1. Luôn nhờ luật sư rà soát trước khi ký
2. Đàm phán các điều khoản bất lợi
3. Yêu cầu bổ sung điều khoản còn thiếu
4. Lưu giữ bản sao hợp đồng có chữ ký',
     '5 Sai Lầm Thường Gặp Khi Ký Kết Hợp Đồng | LawFirm',
     'Những sai lầm phổ biến khi ký kết hợp đồng có thể gây thiệt hại lớn cho doanh nghiệp. Cùng LawFirm tìm hiểu và tránh xa chúng');

-- Post Translations (English)
INSERT INTO locale_keys (entity_type, entity_id, locale, title, excerpt, content, meta_title, meta_desc)
VALUES 
    ('posts', 'po000006-0001-0001-0001-000000000006', 'en',
     'Understanding Vietnamese Business Law: Key Points for Foreign Investors',
     'An overview of Vietnamese business law essentials for foreign investors looking to establish operations.',
     '## 1. Legal Framework

Vietnamese business law is primarily governed by:
- Enterprise Law 2020
- Commercial Law 2005
- Investment Law 2020
- Competition Law 2018

## 2. Business Registration

Foreign investors can establish:
- 100% foreign-owned company
- Joint venture with Vietnamese partner
- Representative office
- Branch office

## 3. Investment Incentives

Sectors eligible for incentives:
- High technology
- Education and training
- Healthcare
- Environmental protection
- Infrastructure development

## 4. Required Licenses

Depending on your business type, you may need:
- Investment registration certificate
- Enterprise registration certificate
- Industry-specific licenses
- Work permits for foreign employees

## 5. Tax Obligations

Key taxes include:
- Corporate Income Tax: 20% (standard rate)
- VAT: 0%, 5%, 10%
- Special Consumption Tax
- Personal Income Tax',
     'Understanding Vietnamese Business Law | LawFirm',
     'Key points of Vietnamese business law for foreign investors and international businesses');

-- ============================================================
-- Post Tags
-- ============================================================
INSERT INTO post_tags (post_id, tag_id)
VALUES 
    ('po000001-0001-0001-0001-000000000001', 'tg000002-0001-0001-0001-000000000002'),
    ('po000001-0001-0001-0001-000000000001', 'tg000006-0001-0001-0001-000000000006'),
    ('po000002-0001-0001-0001-000000000002', 'tg000003-0001-0001-0001-000000000003'),
    ('po000003-0001-0001-0001-000000000003', 'tg000004-0001-0001-0001-000000000004'),
    ('po000004-0001-0001-0001-000000000004', 'tg000001-0001-0001-0001-000000000001'),
    ('po000005-0001-0001-0001-000000000005', 'tg000006-0001-0001-0001-000000000006'),
    ('po000006-0001-0001-0001-000000000006', 'tg000001-0001-0001-0001-000000000001');
