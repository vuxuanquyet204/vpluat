/**
 * Format a Date as `YYYY-MM-DD` using the *local* timezone. Unlike
 * `toISOString().slice(0, 10)` (which converts to UTC and can drift by one
 * day for users in UTC+offset), this preserves the date the user actually
 * clicked on the calendar.
 */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatBookingDateLabel(date: Date) {
  const dayNames = [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ];

  return `${dayNames[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function createMonthLabel(date: Date) {
  const months = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];

  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function createDayMatrix(currentMonth: Date, selectedDate: Date | null) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startPad = firstDay === 0 ? 6 : firstDay - 1;
  const days = Array.from({ length: startPad }).map((_, index) => ({
    key: `pad-${index}`,
    label: '',
    isPadding: true,
    isDisabled: true,
    isToday: false,
    isSelected: false,
    hasSlot: false,
    date: null as Date | null,
  }));

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isPast = date.getTime() < today.getTime();
    const isToday = date.getTime() === today.getTime();
    const isSelected =
      selectedDate !== null && date.toDateString() === selectedDate.toDateString();
    const hasSlot = !isWeekend && !isPast;

    days.push({
      key: date.toISOString(),
      label: String(day),
      isPadding: false,
      isDisabled: isWeekend || isPast,
      isToday,
      isSelected,
      hasSlot,
      date,
    });
  }

  return days;
}
