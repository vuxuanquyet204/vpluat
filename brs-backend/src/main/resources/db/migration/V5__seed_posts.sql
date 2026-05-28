-- ============================================================
-- V5__seed_posts.sql
-- BRS v2.0 - Posts/Blog Seed Data
-- ============================================================

DO $$
DECLARE
    news_cat_id UUID;
    procedure_cat_id UUID;
    knowledge_cat_id UUID;
    editor_id UUID;
    tag1_id UUID;
    tag2_id UUID;
    tag3_id UUID;
    tag4_id UUID;
    tag5_id UUID;
    post1_id UUID;
    post2_id UUID;
    post3_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO news_cat_id FROM categories WHERE slug = 'tin-tuc-phap-luat' LIMIT 1;
    SELECT id INTO procedure_cat_id FROM categories WHERE slug = 'huong-dan-thu-tuc' LIMIT 1;
    SELECT id INTO knowledge_cat_id FROM categories WHERE slug = 'kien-thuc-phap-ly' LIMIT 1;

    -- Get editor user ID
    SELECT id INTO editor_id FROM users WHERE email = 'editor@lawfirm.vn' LIMIT 1;

    -- Get or create tags
    INSERT INTO tags (id, slug, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), 'luat-kinh-doanh', NOW(), NOW(), editor_id)
    ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
    RETURNING id INTO tag1_id;

    INSERT INTO tags (id, slug, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), 'luat-lao-dong', NOW(), NOW(), editor_id)
    ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
    RETURNING id INTO tag2_id;

    INSERT INTO tags (id, slug, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), 'so-huu-tri-tue', NOW(), NOW(), editor_id)
    ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
    RETURNING id INTO tag3_id;

    INSERT INTO tags (id, slug, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), 'thue-thu-nhap', NOW(), NOW(), editor_id)
    ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
    RETURNING id INTO tag4_id;

    INSERT INTO tags (id, slug, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), 'hop-dong', NOW(), NOW(), editor_id)
    ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
    RETURNING id INTO tag5_id;

    -- Insert posts
    INSERT INTO posts (id, slug, thumbnail_url, author_id, category_id, status, published_at, views, reading_time, is_featured, language, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), '10-dieu-doanh-nghiep-can-biet-ve-hop-dong-lao-dong',
            'https://images.unsplash.com/photo-1450101499163-c8848c66ca85',
            editor_id, procedure_cat_id, 'PUBLISHED', NOW() - INTERVAL '7 days',
            1250, 8, true, 'vi', NOW(), NOW(), editor_id)
    RETURNING id INTO post1_id;

    INSERT INTO posts (id, slug, thumbnail_url, author_id, category_id, status, published_at, views, reading_time, is_featured, language, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), 'huong-dan-dang-ky-so-huu-tri-tue-nhanh-chong',
            'https://images.unsplash.com/photo-1589829545856-d10d557cf95f',
            editor_id, procedure_cat_id, 'PUBLISHED', NOW() - INTERVAL '14 days',
            890, 12, true, 'vi', NOW(), NOW(), editor_id)
    RETURNING id INTO post2_id;

    INSERT INTO posts (id, slug, thumbnail_url, author_id, category_id, status, published_at, views, reading_time, is_featured, language, created_at, updated_at, created_by)
    VALUES (gen_random_uuid(), 'thue-thu-nhap-ca-nhan-2026-nhung-dieu-moi',
            'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
            editor_id, news_cat_id, 'PUBLISHED', NOW() - INTERVAL '3 days',
            2100, 10, true, 'vi', NOW(), NOW(), editor_id)
    RETURNING id INTO post3_id;

    -- Insert post tags
    INSERT INTO post_tags (post_id, tag_id) VALUES
        (post1_id, tag2_id), (post1_id, tag5_id),
        (post2_id, tag3_id),
        (post3_id, tag4_id);

    -- Insert post translations
    INSERT INTO locale_keys (entity_type, entity_id, locale, title, excerpt)
    VALUES
        ('posts', post1_id, 'vi', '10 Điều Doanh Nghiệp Cần Biết Về Hợp Đồng Lao Động',
         'Hợp đồng lao động là văn bản quan trọng giữa người sử dụng lao động và người lao động.'),
        ('posts', post2_id, 'vi', 'Hướng Dẫn Đăng Ký Sở Hữu Trí Tuệ Nhanh Chóng',
         'Sở hữu trí tuệ là tài sản quý giá của doanh nghiệp. Hướng dẫn đăng ký bảo hộ nhanh chóng.'),
        ('posts', post3_id, 'vi', 'Thuế Thu Nhập Cá Nhân 2026: Những Điều Mới Cần Biết',
         'Năm 2026 có nhiều thay đổi về thuế thu nhập cá nhân. Cập nhật ngay để tránh vi phạm.');
END $$;
