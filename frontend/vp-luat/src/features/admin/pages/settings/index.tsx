'use client';

import { useState } from 'react';
import { Save, Building2, Phone, Mail, Clock, DollarSign } from 'lucide-react';
import { AdminPageHeader } from '@/features/admin/shared';

export default function SettingsPage() {
  const [form, setForm] = useState({
    siteName: 'VP Luật - Công ty Luật',
    hotline: '1900 1234',
    email: 'contact@vpluat.vn',
    address: '123 Nguyễn Trãi, Quận 1, TP.HCM',
    workStart: '08:00',
    workEnd: '18:00',
    slotDuration: '60',
    bookingLeadTime: '24',
    currency: 'VND',
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const SettingSection = ({
    icon,
    title,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="admin-card" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-faint, #EFF3F8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
          {icon}
        </div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '4px' }}>
        {label}
      </label>
      {children}
    </div>
  );

  const Input = ({
    value,
    onChange,
    type = 'text',
    placeholder,
    prefix,
  }: {
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    prefix?: React.ReactNode;
  }) => (
    <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--gray-200)', borderRadius: '8px', overflow: 'hidden' }}>
      {prefix && (
        <div style={{ padding: '0 10px', background: 'var(--gray-50)', borderRight: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', height: '100%' }}>
          {prefix}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          padding: '9px 12px',
          border: 'none',
          outline: 'none',
          fontSize: '0.85rem',
          fontFamily: 'inherit',
          background: 'transparent',
        }}
      />
    </div>
  );

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Cài đặt hệ thống"
        subtitle="Cấu hình các thông số hệ thống"
        actions={
          <button type="button" className="action-btn action-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Save size={14} />
            Lưu thay đổi
          </button>
        }
      />

      <SettingSection icon={<Building2 size={16} />} title="Thông tin công ty">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Tên website">
            <Input value={form.siteName} onChange={(v) => handleChange('siteName', v)} placeholder="Tên công ty" />
          </Field>
          <Field label="Địa chỉ">
            <Input value={form.address} onChange={(v) => handleChange('address', v)} placeholder="Địa chỉ công ty" />
          </Field>
        </div>
      </SettingSection>

      <SettingSection icon={<Phone size={16} />} title="Liên hệ">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Hotline">
            <Input value={form.hotline} onChange={(v) => handleChange('hotline', v)} placeholder="1900 xxxx" prefix={<Phone size={14} style={{ color: 'var(--gray-400)' }} />} />
          </Field>
          <Field label="Email liên hệ">
            <Input value={form.email} onChange={(v) => handleChange('email', v)} placeholder="email@vpluat.vn" prefix={<Mail size={14} style={{ color: 'var(--gray-400)' }} />} />
          </Field>
        </div>
      </SettingSection>

      <SettingSection icon={<Clock size={16} />} title="Giờ làm việc & Booking">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <Field label="Giờ bắt đầu">
            <Input value={form.workStart} onChange={(v) => handleChange('workStart', v)} type="time" />
          </Field>
          <Field label="Giờ kết thúc">
            <Input value={form.workEnd} onChange={(v) => handleChange('workEnd', v)} type="time" />
          </Field>
          <Field label="Thời lượng slot (phút)">
            <Input value={form.slotDuration} onChange={(v) => handleChange('slotDuration', v)} placeholder="60" prefix={<Clock size={14} style={{ color: 'var(--gray-400)' }} />} />
          </Field>
          <Field label="Thời gian đặt trước tối thiểu (giờ)">
            <Input value={form.bookingLeadTime} onChange={(v) => handleChange('bookingLeadTime', v)} placeholder="24" />
          </Field>
        </div>
      </SettingSection>

      <SettingSection icon={<DollarSign size={16} />} title="Tiền tệ">
        <div style={{ display: 'grid', gridTemplateColumns: '200px', gap: '16px' }}>
          <Field label="Đơn vị tiền tệ">
            <select
              value={form.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1.5px solid var(--gray-200)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'inherit',
                background: 'white',
              }}
            >
              <option value="VND">VND - Việt Nam Đồng</option>
              <option value="USD">USD - US Dollar</option>
            </select>
          </Field>
        </div>
      </SettingSection>
    </div>
  );
}
