import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../utils';
import { BookingPage } from '@/features/booking';

describe('booking page shell', () => {
  it('renders booking hero and first step copy', () => {
    renderWithProviders(<BookingPage />);

    expect(screen.getByText('Đặt Lịch Tư Vấn Pháp Lý')).toBeInTheDocument();
    expect(screen.getByText('Bạn cần tư vấn về lĩnh vực nào?')).toBeInTheDocument();
    expect(screen.getByText('Chọn luật sư bạn muốn tư vấn')).toBeInTheDocument();
  });
});
