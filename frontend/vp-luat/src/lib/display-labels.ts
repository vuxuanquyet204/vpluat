const DISPLAY_LABELS: Record<string, string> = {
  'tu-van-phap-ly': 'Tư vấn pháp lý',
  'dai-dien-phap-ly': 'Đại diện pháp lý',
  'to-cao-khieu-nai': 'Tố cáo & khiếu nại',
  'thu-tuc-hanh-chinh': 'Thủ tục hành chính',
  'doanh-nghiep': 'Doanh nghiệp',
  'dan-su': 'Dân sự',
  'dat-dai': 'Đất đai & bất động sản',
  'nha-dat': 'Nhà đất & bất động sản',
  'lao-dong': 'Lao động',
  'hinh-su': 'Hình sự',
  'so-huu-tri-tue': 'Sở hữu trí tuệ',
  'fdi': 'Đầu tư nước ngoài',
  'ma': 'M&A',
  'tin-tuc': 'Tin tức',
  'nghi-dinh': 'Nghị định',
  'blog': 'Blog',
  'case-study': 'Tình huống thực tế',
  'huong-dan': 'Hướng dẫn',
  other: 'Khác',
};

function titleCaseSlug(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function getDisplayLabel(value?: string | null, fallback = 'Dịch vụ'): string {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;

  const normalized = trimmed.toLowerCase();
  if (DISPLAY_LABELS[normalized]) return DISPLAY_LABELS[normalized];
  if (!/[-_]/.test(normalized)) return trimmed;
  return titleCaseSlug(normalized);
}
