import type { Lawyer, LawyerStat, SpecialtyFilter } from '../../types';

// Backend đã trả về đầy đủ lawyer từ `/public/lawyers`. Mảng tĩnh này
// KHÔNG còn được dùng để render UI, giữ lại để test/mock nếu cần.
export const LAWYERS: Lawyer[] = [];

export const LAWYERS_BY_ID: Record<string, Lawyer> = Object.fromEntries(
  LAWYERS.map((l) => [l.id, l]),
);

export const LAWYERS_BY_SLUG: Record<string, Lawyer> = Object.fromEntries(
  LAWYERS.map((l) => [l.slug, l]),
);

// Position/label nên render trực tiếp từ field `position` mà backend trả về
// (BE đã trả về text "Trưởng Văn Phòng" qua positionVi/positionEn, FE chỉ cần hiển thị).
// Bỏ hẳn lookup cứng slug → label vì admin có thể sửa slug/label.
export const SPECIALTY_FILTERS_PLACEHOLDER: SpecialtyFilter[] = [
  { id: 'all', label: 'Tất cả', icon: 'fa-solid fa-users' },
];

export const LAWYERS_STATS: LawyerStat[] = [
  { value: '20+', label: 'Năm KN' },
  { value: '1,000+', label: 'Vụ thành công' },
  { value: '4.7', label: 'Đánh giá TB' },
];
