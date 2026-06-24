-- V10__add_more_services.sql
-- Add additional services for booking

DO $$
DECLARE
    tu_van_hop_dong_id UUID;
    ly_hon_id UUID;
    ma_id UUID;
    fdi_id UUID;
    hinh_su_id UUID;
BEGIN
    -- Insert "Tư vấn hợp đồng" service
    INSERT INTO services (id, slug, name, icon, is_featured, display_order, is_active, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), 'tu-van-hop-dong', 'Tư Vấn Hợp Đồng', 'file-signature', false, 9, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO tu_van_hop_dong_id;

    -- Insert "Ly hôn & tranh chấp gia đình" service
    INSERT INTO services (id, slug, name, icon, is_featured, display_order, is_active, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), 'ly-hon', 'Ly Hôn & Tranh Chấp Gia Đình', 'users', false, 10, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO ly_hon_id;

    -- Insert "M&A" service
    INSERT INTO services (id, slug, name, icon, is_featured, display_order, is_active, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), 'ma', 'M&A — Mua Bán & Sáp Nhập', 'handshake', false, 11, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO ma_id;

    -- Insert "FDI" service
    INSERT INTO services (id, slug, name, icon, is_featured, display_order, is_active, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), 'fdi', 'FDI — Đầu Tư Nước Ngoài', 'globe', false, 12, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO fdi_id;

    -- Insert "Luật hình sự" service
    INSERT INTO services (id, slug, name, icon, is_featured, display_order, is_active, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), 'hinh-su', 'Luật Hình Sự', 'shield', false, 13, true, NOW(), NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO hinh_su_id;

    -- Update name for existing services that might be missing
    UPDATE services SET name = 'Tư Vấn Pháp Lý' WHERE slug = 'tu-van-phap-ly' AND name IS NULL;
    UPDATE services SET name = 'Đại Diện Pháp Lý' WHERE slug = 'dai-dien-phap-ly' AND name IS NULL;
    UPDATE services SET name = 'Tố Cáo, Khiếu Nại' WHERE slug = 'to-cao-khieu-nai' AND name IS NULL;
    UPDATE services SET name = 'Thủ Tục Hành Chính' WHERE slug = 'thu-tuc-hanh-chinh' AND name IS NULL;
    UPDATE services SET name = 'Sở Hữu Trí Tuệ' WHERE slug = 'so-huu-tri-tue' AND name IS NULL;
    UPDATE services SET name = 'Luật Lao Động' WHERE slug = 'lao-dong' AND name IS NULL;
    UPDATE services SET name = 'Doanh Nghiệp' WHERE slug = 'doanh-nghiep' AND name IS NULL;
    UPDATE services SET name = 'Nhà Đất' WHERE slug = 'nha-dat' AND name IS NULL;
END $$;
