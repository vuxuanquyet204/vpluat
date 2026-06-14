'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import {
  AdminPageHeader,
  SearchBar,
  Badge,
  ActionButtons,
  Pagination,
  Modal,
} from '@/features/admin/shared';
import type { Service, Lawyer } from '@/features/admin/types';

const MOCK_SERVICES: Service[] = [
  { id: '1', name: 'Thành lập công ty', description: 'Dịch vụ thành lập doanh nghiệp trọn gói', price: 5000000, duration: 7, category: 'Doanh nghiệp', isActive: true, lawyerIds: ['1', '2'], createdAt: '2025-01-01T00:00:00Z' },
  { id: '2', name: 'Tư vấn pháp luật', description: 'Tư vấn các vấn đề pháp lý', price: 500000, duration: 1, category: 'Pháp luật', isActive: true, lawyerIds: ['1', '2', '3'], createdAt: '2025-01-01T00:00:00Z' },
  { id: '3', name: 'Hợp đồng thuê nhà', description: 'Soạn thảo và kiểm tra hợp đồng thuê', price: 1500000, duration: 3, category: 'Nhà đất', isActive: true, lawyerIds: ['3'], createdAt: '2025-01-01T00:00:00Z' },
  { id: '4', name: 'Sở hữu trí tuệ', description: 'Đăng ký nhãn hiệu, sáng chế, bản quyền', price: 8000000, duration: 30, category: 'Sở hữu trí tuệ', isActive: true, lawyerIds: ['2'], createdAt: '2025-01-01T00:00:00Z' },
  { id: '5', name: 'Ly hôn', description: 'Tư vấn và hỗ trợ ly hôn thuận tình', price: 3000000, duration: 14, category: 'Gia đình', isActive: false, lawyerIds: ['1'], createdAt: '2025-01-01T00:00:00Z' },
  { id: '6', name: 'Mua bán bất động sản', description: 'Tư vấn và hỗ trợ giao dịch BĐS', price: 10000000, duration: 21, category: 'Nhà đất', isActive: true, lawyerIds: ['2', '3'], createdAt: '2025-01-01T00:00:00Z' },
];

const MOCK_LAWYERS: Lawyer[] = [
  { id: '1', name: 'LS. Hoàng Lan', title: 'Luật sư cao cấp', bio: '10+ năm kinh nghiệm trong lĩnh vực doanh nghiệp và sở hữu trí tuệ', avatar: 'https://i.pravatar.cc/100?img=1', specialties: ['Doanh nghiệp', 'Sở hữu trí tuệ'], email: 'lan@vpluat.vn', phone: '0901 111 111', experience: 12, isActive: true, serviceIds: ['1', '2', '5'], createdAt: '2025-01-01T00:00:00Z' },
  { id: '2', name: 'LS. Đức Minh', title: 'Luật sư', bio: 'Chuyên gia trong lĩnh vực bất động sản và hợp đồng', avatar: 'https://i.pravatar.cc/100?img=2', specialties: ['Nhà đất', 'Hợp đồng'], email: 'minh@vpluat.vn', phone: '0902 222 222', experience: 8, isActive: true, serviceIds: ['1', '2', '4', '6'], createdAt: '2025-01-01T00:00:00Z' },
  { id: '3', name: 'LS. Thu Hà', title: 'Luật sư', bio: 'Chuyên về luật gia đình và tư vấn pháp luật', avatar: 'https://i.pravatar.cc/100?img=3', specialties: ['Gia đình', 'Pháp luật'], email: 'ha@vpluat.vn', phone: '0903 333 333', experience: 6, isActive: true, serviceIds: ['2', '3', '6'], createdAt: '2025-01-01T00:00:00Z' },
  { id: '4', name: 'LS. Minh Tuấn', title: 'Luật sư', bio: 'Chuyên gia về luật thương mại quốc tế', avatar: 'https://i.pravatar.cc/100?img=4', specialties: ['Thương mại', 'Quốc tế'], email: 'tuan@vpluat.vn', phone: '0904 444 444', experience: 5, isActive: false, serviceIds: ['2'], createdAt: '2025-01-01T00:00:00Z' },
];

function formatPrice(v?: number) {
  if (v == null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
}

export default function ServicesPage() {
  const [tab, setTab] = useState<'services' | 'lawyers'>('services');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const LIMIT = 10;

  const isServices = tab === 'services';
  const data = isServices ? MOCK_SERVICES : MOCK_LAWYERS;
  const filtered = data.filter((item) => {
    const name = isServices ? (item as Service).name : (item as Lawyer).name;
    const category = isServices ? (item as Service).category : '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      category.toLowerCase().includes(search.toLowerCase())
    );
  });

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Dịch vụ & Luật sư"
        subtitle="Quản lý dịch vụ pháp lý và đội ngũ luật sư"
        actions={
          <button
            type="button"
            className="action-btn action-btn--primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={14} />
            {isServices ? 'Thêm dịch vụ' : 'Thêm luật sư'}
          </button>
        }
      />

      {/* Tab switcher */}
      <div className="filter-bar" style={{ marginBottom: '16px' }}>
        <button
          type="button"
          className={`filter-tab ${tab === 'services' ? 'filter-tab--active' : ''}`}
          onClick={() => { setTab('services'); setPage(1); }}
        >
          Danh sách dịch vụ
        </button>
        <button
          type="button"
          className={`filter-tab ${tab === 'lawyers' ? 'filter-tab--active' : ''}`}
          onClick={() => { setTab('lawyers'); setPage(1); }}
        >
          Đội ngũ luật sư
        </button>
      </div>

      <div className="admin-card">
        <SearchBar
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder={isServices ? 'Tìm theo tên dịch vụ, danh mục...' : 'Tìm theo tên luật sư...'}
        />

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {isServices ? (
                  <>
                    <th>Dịch vụ</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </>
                ) : (
                  <>
                    <th>Luật sư</th>
                    <th>Chuyên môn</th>
                    <th>Kinh nghiệm</th>
                    <th>Liên hệ</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : isServices ? (
                paginated.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{(s as Service).name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{(s as Service).description}</div>
                      </div>
                    </td>
                    <td><Badge variant="blue">{(s as Service).category}</Badge></td>
                    <td style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{formatPrice((s as Service).price)}</td>
                    <td style={{ color: 'var(--gray-600)' }}>{(s as Service).duration} ngày</td>
                    <td>
                      <Badge variant={(s as Service).isActive ? 'green' : 'red'}>
                        {(s as Service).isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </td>
                    <td>
                      <ActionButtons
                        actions={[
                          { label: 'Sửa', variant: 'default', onClick: () => {} },
                          { label: 'Xóa', variant: 'danger', onClick: () => {} },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                paginated.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {(l as Lawyer).avatar ? (
                          <img
                            src={(l as Lawyer).avatar}
                            alt={(l as Lawyer).name}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-faint, #EFF3F8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', flexShrink: 0 }}>
                            {(l as Lawyer).name.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{(l as Lawyer).name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{(l as Lawyer).title}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(l as Lawyer).specialties.map((sp) => (
                          <Badge key={sp} variant="blue" style={{ fontSize: '0.68rem' }}>{sp}</Badge>
                        ))}
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-600)' }}>{(l as Lawyer).experience} năm</td>
                    <td>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>{(l as Lawyer).email}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{(l as Lawyer).phone}</div>
                    </td>
                    <td>
                      <Badge variant={(l as Lawyer).isActive ? 'green' : 'red'}>
                        {(l as Lawyer).isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </td>
                    <td>
                      <ActionButtons
                        actions={[
                          { label: 'Sửa', variant: 'default', onClick: () => {} },
                          { label: 'Xóa', variant: 'danger', onClick: () => {} },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} limit={LIMIT} total={filtered.length} onPageChange={setPage} />
      </div>
    </div>
  );
}
