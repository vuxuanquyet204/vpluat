-- V20: Update services.name with proper Vietnamese labels for services
-- that still inherit the slug as their display name. The contract for
-- ServiceDTO (and the admin UI) is `name = display label`, so this
-- migration makes every row satisfy the contract without touching the
-- schema.
--
-- Idempotent: only updates rows where name still equals slug, so it can
-- be re-run safely. Also updates updated_at so admin cache eviction sees
-- the change.

UPDATE services
SET name = 'Tư Vấn Pháp Lý',
    updated_at = NOW()
WHERE slug = 'tu-van-phap-ly'
  AND name = slug;

UPDATE services
SET name = 'Đại Diện Pháp Lý',
    updated_at = NOW()
WHERE slug = 'dai-dien-phap-ly'
  AND name = slug;

UPDATE services
SET name = 'Tố Cáo & Khiếu Nại',
    updated_at = NOW()
WHERE slug = 'to-cao-khieu-nai'
  AND name = slug;

UPDATE services
SET name = 'Thủ Tục Hành Chính',
    updated_at = NOW()
WHERE slug = 'thu-tuc-hanh-chinh'
  AND name = slug;

UPDATE services
SET name = 'Sở Hữu Trí Tuệ',
    updated_at = NOW()
WHERE slug = 'so-huu-tri-tue'
  AND name = slug;

UPDATE services
SET name = 'Lao Động',
    updated_at = NOW()
WHERE slug = 'lao-dong'
  AND name = slug;

UPDATE services
SET name = 'Doanh Nghiệp',
    updated_at = NOW()
WHERE slug = 'doanh-nghiep'
  AND name = slug;

UPDATE services
SET name = 'Nhà Đất',
    updated_at = NOW()
WHERE slug = 'nha-dat'
  AND name = slug;