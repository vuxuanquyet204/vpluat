# Phase 8: Booking Module — Backend Endpoints + Mock-to-Real Migration

> **Mục tiêu**: Xây dựng đầy đủ REST API cho module Booking/Lịch hẹn Admin, sau đó thay thế toàn bộ mock data bằng API calls thật trong frontend.

> **Quyết định kiến trúc**:
> - ✅ **Backend-first** — Ưu tiên xây dựng endpoint trước, sau đó wire frontend
> - ✅ **Tái sử dụng entity** — Dùng `LawyerSchedule`, `LawyerScheduleOverride` đã có, bổ sung controller + service
> - ✅ **Consistent response** — Tất cả endpoint trả về `ApiResponse<T>`
> - ✅ **TanStack Query** — Frontend dùng `@tanstack/react-query` cho caching + loading state

---

# MỤC LỤC

| # | Section | Mô tả |
|:-:|:-|:-|
| 01 | Hiện trạng | Gap analysis đầy đủ backend + frontend |
| 02 | Backend Endpoints | Chi tiết từng endpoint cần xây dựng |
| 03 | Database Migration | V8 migration schema |
| 04 | Frontend Migration | Thay thế mock → real API |
| 05 | Task list | Chi tiết từng task |
| 06 | Lộ trình | Thứ tự triển khai |

---

# 01. HIỆN TRẠNG

## 1.1 Backend — Đã có

```
BookingController (/api/bookings)
├── POST   /api/bookings                          ✅ Create booking (public, OTP required)
├── POST   /api/bookings/{id}/verify              ✅ Verify OTP
├── POST   /api/bookings/{id}/resend-otp          ✅ Resend OTP
├── POST   /api/bookings/{id}/cancel              ✅ Cancel
├── GET    /api/bookings/{id}                     ✅ Get by ID
├── GET    /api/bookings                          ✅ Paginated list
├── PATCH  /api/bookings/{id}/status              ✅ Update status
├── POST   /api/bookings/{id}/reschedule          ✅ Reschedule
├── GET    /api/bookings/calendar                 ✅ Calendar events (range)
└── POST   /api/bookings/admin                    ✅ Admin create (no OTP)

AvailabilityController (/api/bookings/availability)
├── GET    /api/bookings/availability/{lawyerId}  ✅ Get slots for lawyer
├── POST   /api/bookings/availability             ✅ Create slot
├── DELETE /api/bookings/availability/{id}        ✅ Delete slot
├── POST   /api/bookings/availability/reserve     ✅ Reserve slot
├── POST   /api/bookings/availability/release     ✅ Release reservation
└── GET    /api/bookings/availability/reservations/{id}  ✅ Verify reservation

Entities đã có
├── Appointment.java                              ✅
├── LawyerSchedule.java                           ✅ Entity only, no controller
├── LawyerScheduleOverride.java                   ✅ Entity + basic repo
└── AppointmentReminderScheduler.java             ✅ Scheduler only, no API config
```

## 1.2 Backend — Thiếu

```
LawyerScheduleController (MỚI)
├── GET  /api/admin/lawyers/{lawyerId}/schedule
├── PUT  /api/admin/lawyers/{lawyerId}/schedule
├── GET  /api/admin/lawyers/schedules?from=&to=
└── POST /api/admin/lawyers/{lawyerId}/schedule/override

BookingReminderConfigController (MỞ RỘNG BookingController)
├── PATCH /api/bookings/{id}/reminders
└── GET   /api/bookings/{id}/reminders

BookingStatsController (MỚI)
└── GET  /api/admin/bookings/stats?date=

BookingHistoryController (MỚI)
└── GET  /api/bookings/{id}/history
```

## 1.3 Frontend — Hiện trạng

```
admin-booking.ts (đang mock)
├── bookingApi.list()                    ⚠️ Gọi mock localStorage
├── bookingApi.get()                     ⚠️ Gọi mock localStorage
├── bookingApi.calendar()                ⚠️ Gọi mock localStorage
├── bookingApi.reschedule()              ⚠️ Gọi mock localStorage
├── bookingApi.updateStatus()             ⚠️ Gọi mock localStorage
├── bookingApi.adminCreate()              ⚠️ Gọi mock localStorage
├── lawyerScheduleApi.list()              ⚠️ Gọi mock localStorage
└── lawyerScheduleApi.save()             ⚠️ Gọi mock localStorage

use-bookings.ts (đang mock)
├── useBookings()                        ⚠️ useMockQuery('bookings')
└── useBooking()                         ⚠️ MockDB.getById()

use-availability.ts (đang mock)
├── useAvailability()                    ⚠️ MockDB query
└── useLawyerSchedules()                ⚠️ MockDB query

use-booking-mutations.ts (đang mock)
├── useCreateBooking()                   ⚠️ MockDB.insert()
├── useUpdateBooking()                   ⚠️ MockDB.update()
├── useChangeBookingStatus()             ⚠️ MockDB.update()
└── useDeleteBooking()                   ⚠️ MockDB.delete()
```

---

# 02. BACKEND ENDPOINTS

## 2.1 LawyerScheduleController

**Base path**: `/api/admin/lawyers`

### GET /{lawyerId}/schedule

Lấy lịch làm việc hàng tuần của 1 luật sư.

```
GET /api/admin/lawyers/{lawyerId}/schedule

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "lawyerId": "uuid",
      "dayOfWeek": 1,        // 0=Sunday, 1=Monday, ..., 6=Saturday
      "isOff": false,
      "slots": [
        { "start": "08:00", "end": "12:00" },
        { "start": "13:00", "end": "17:00" }
      ],
      "effectiveFrom": "2026-01-01",
      "effectiveTo": null,
      "note": null
    }
  ]
}
```

### PUT /{lawyerId}/schedule

Batch update lịch làm việc (7 ngày).

```
PUT /api/admin/lawyers/{lawyerId}/schedule
Content-Type: application/json

Request body:
{
  "slots": [
    {
      "dayOfWeek": 1,
      "isOff": false,
      "slots": [
        { "start": "08:00", "end": "12:00" },
        { "start": "13:00", "end": "17:00" }
      ],
      "note": null
    },
    // ... 7 items (0-6)
  ]
}

Response 200:
{
  "success": true,
  "data": [ /* updated LawyerSchedule[] */ ]
}
```

### GET /schedules

Lấy lịch tất cả luật sư trong khoảng ngày (cho AvailabilityView).

```
GET /api/admin/lawyers/schedules?from=2026-06-20&to=2026-06-30

Response 200:
{
  "success": true,
  "data": {
    "lawyerId-1": {
      "regular": [ /* LawyerSchedule[] */ ],
      "overrides": [ /* LawyerScheduleOverride[] */ ]
    },
    "lawyerId-2": { ... }
  }
}
```

### POST /{lawyerId}/schedule/override

Tạo override cho ngày đặc biệt (nghỉ/làm thêm).

```
POST /api/admin/lawyers/{lawyerId}/schedule/override
Content-Type: application/json

Request body:
{
  "overrideDate": "2026-06-25",      // Ngày cần override
  "type": "off",                     // "off" | "custom"
  "slots": [                         // Bắt buộc nếu type=custom
    { "start": "09:00", "end": "14:00" }
  ],
  "reason": "Nghỉ lễ 30/4"
}

Response 201:
{
  "success": true,
  "data": { /* LawyerScheduleOverride */ }
}
```

## 2.2 BookingReminderConfigController

**Mở rộng BookingController**.

### GET /{id}/reminders

Lấy cấu hình reminder của booking.

```
GET /api/bookings/{id}/reminders

Response 200:
{
  "success": true,
  "data": {
    "appointmentId": "uuid",
    "reminders": [
      { "type": "24h", "enabled": true, "channel": "email" },
      { "type": "2h", "enabled": true, "channel": "sms" },
      { "type": "30min", "enabled": false, "channel": "in_app" }
    ]
  }
}
```

### PATCH /{id}/reminders

Cập nhật cấu hình reminder.

```
PATCH /api/bookings/{id}/reminders
Content-Type: application/json

Request body:
{
  "reminders": [
    { "type": "24h", "enabled": true, "channel": "email" },
    { "type": "2h", "enabled": false, "channel": "sms" },
    { "type": "30min", "enabled": true, "channel": "in_app" }
  ]
}

Response 200:
{
  "success": true,
  "data": { /* updated config */ }
}
```

## 2.3 BookingStatsController

### GET /stats

Lấy thống kê booking cho dashboard.

```
GET /api/admin/bookings/stats?date=2026-06-20

Response 200:
{
  "success": true,
  "data": {
    "date": "2026-06-20",
    "total": 45,
    "pending": 12,
    "confirmed": 28,
    "completed": 3,
    "cancelled": 2,
    "todayAppointments": [
      {
        "id": "uuid",
        "clientName": "Nguyễn Văn A",
        "lawyerName": "LS. Hùng",
        "serviceName": "Tư vấn FDI",
        "scheduledAt": "2026-06-20T09:00:00",
        "status": "confirmed"
      }
    ]
  }
}
```

## 2.4 BookingHistoryController

### GET /{id}/history

Lấy lịch sử thay đổi của booking.

```
GET /api/bookings/{id}/history

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "appointmentId": "uuid",
      "type": "create",
      "fromValue": null,
      "toValue": null,
      "reason": null,
      "actorId": "uuid",
      "actorName": "Lan",
      "createdAt": "2026-06-20T08:00:00Z"
    },
    {
      "id": "uuid",
      "appointmentId": "uuid",
      "type": "status_change",
      "fromValue": "PENDING",
      "toValue": "CONFIRMED",
      "reason": null,
      "actorId": "uuid",
      "actorName": "Lan",
      "createdAt": "2026-06-20T08:30:00Z"
    },
    {
      "id": "uuid",
      "appointmentId": "uuid",
      "type": "reschedule",
      "fromValue": "2026-06-20T09:00:00",
      "toValue": "2026-06-20T10:00:00",
      "reason": "Khách xin dời",
      "actorId": "uuid",
      "actorName": "Minh",
      "createdAt": "2026-06-20T09:15:00Z"
    }
  ]
}
```

---

# 03. DATABASE MIGRATION

## V8__booking_erp_extend.sql

```sql
-- 1. Bảng lịch sử thay đổi booking
CREATE TABLE appointment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,  -- create, update, status_change, reschedule, cancel, reminder_sent
    from_value TEXT,
    to_value TEXT,
    reason TEXT,
    actor_id UUID REFERENCES users(id),
    actor_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointment_history_appointment_id ON appointment_history(appointment_id);
CREATE INDEX idx_appointment_history_created_at ON appointment_history(created_at DESC);

-- 2. LawyerSchedule - đảm bảo unique constraint
ALTER TABLE lawyer_schedules
ADD CONSTRAINT uk_lawyer_schedule_lawyer_day
UNIQUE (lawyer_id, day_of_week);

-- 3. Bổ sung lawyer_schedule_overrides
ALTER TABLE lawyer_schedule_overrides
ADD COLUMN IF NOT EXISTS slots JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reason VARCHAR(500) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'off';  -- off, custom

CREATE INDEX IF NOT EXISTS idx_lawyer_schedule_overrides_lawyer_date
ON lawyer_schedule_overrides(lawyer_id, override_date);

-- 4. Bổ sung appointment reminders config (nếu chưa có)
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS reminders_config JSONB DEFAULT '[
  {"type": "24h", "enabled": true, "channel": "email"},
  {"type": "2h", "enabled": true, "channel": "sms"},
  {"type": "30min", "enabled": false, "channel": "in_app"}
]';
```

---

# 04. FRONTEND MIGRATION

## 4.1 admin-booking.ts — Wire API thật

```
lib/api/admin-booking.ts

Thay đổi:
- bookingApi.list() → api.get('/bookings', params)
- bookingApi.get() → api.get('/bookings/${id}')
- bookingApi.calendar() → api.get('/bookings/calendar', params)
- bookingApi.reschedule() → api.post('/bookings/${id}/reschedule', body)
- bookingApi.updateStatus() → api.patch('/bookings/${id}/status', body)
- bookingApi.adminCreate() → api.post('/bookings/admin', body)

Thêm mới:
- bookingApi.getReminders(id) → api.get('/bookings/${id}/reminders')
- bookingApi.updateReminders(id, config) → api.patch('/bookings/${id}/reminders', config)
- bookingApi.getStats(date) → api.get('/admin/bookings/stats', { date })
- bookingApi.getHistory(id) → api.get('/bookings/${id}/history')

- lawyerScheduleApi.list(lawyerId) → api.get('/admin/lawyers/${lawyerId}/schedule')
- lawyerScheduleApi.save(lawyerId, slots) → api.put('/admin/lawyers/${lawyerId}/schedule', { slots })
- lawyerScheduleApi.getAll(from, to) → api.get('/admin/lawyers/schedules', { from, to })
- lawyerScheduleApi.createOverride(lawyerId, override) → api.post('/admin/lawyers/${lawyerId}/schedule/override', override)
```

## 4.2 use-bookings.ts — TanStack Query

```
hooks/use-bookings.ts

Thay đổi:
- useMockQuery('bookings') → useQuery(['bookings', filters], () => bookingApi.list(filters))

Thêm mới:
- useBookingStats(date) → useQuery(['booking-stats', date], () => bookingApi.getStats(date))
- useBookingHistory(id) → useQuery(['booking-history', id], () => bookingApi.getHistory(id))
```

## 4.3 use-availability.ts — TanStack Query

```
hooks/use-availability.ts

Thay đổi:
- MockDB query → useQuery(['lawyer-schedules', from, to], () => lawyerScheduleApi.getAll(from, to))
- MockDB query → useQuery(['bookings-calendar', from, to], () => bookingApi.calendar({ from, to }))
```

## 4.4 use-booking-mutations.ts — TanStack Query mutations

```
hooks/use-booking-mutations.ts

Thay đổi:
- MockDB.insert() → useMutation(() => bookingApi.adminCreate())
- MockDB.update() → useMutation((data) => bookingApi.updateBooking(data))
- MockDB.update() → useMutation((data) => bookingApi.updateStatus(...))
- MockDB.delete() → useMutation((id) => bookingApi.delete(id))

Thêm mới:
- useUpdateReminders() → useMutation((data) => bookingApi.updateReminders(...))
```

## 4.5 booking-detail-drawer.tsx — Mở rộng

```
booking-detail-drawer.tsx

Tab Reminder (MỚI):
- GET /bookings/{id}/reminders → lấy config
- PATCH /bookings/{id}/reminders → lưu config khi toggle

Tab Lịch sử (MỚI):
- GET /bookings/{id}/history → lấy lịch sử thay đổi
- Render timeline với type: create/update/status_change/reschedule/cancel

Nút Reschedule:
- bookingApi.reschedule(id, newTime, reason)

Nút Cancel:
- bookingApi.updateStatus(id, 'cancelled', reason)

Nút Complete:
- bookingApi.updateStatus(id, 'completed')
```

## 4.6 bookings-calendar.tsx — Wire API

```
bookings-calendar.tsx

- GET /bookings/calendar?from=&to= → lấy events cho calendar
- useQuery với params: { from: startOfWeek, to: endOfWeek }
- refetch khi week thay đổi
```

## 4.7 booking-availability-view.tsx — Wire API

```
booking-availability-view.tsx

- GET /admin/lawyers/schedules?from=&to= → lịch tất cả LS
- GET /bookings/calendar?from=&to= → bookings để highlight slot đã book
- useQuery với params: { from: selectedWeek, to: selectedWeek }
```

---

# 05. TASK LIST

## Phase 8A — Backend (Tasks B-01 → B-10)

| # | Task | File | Mô tả | Effort | Phụ thuộc |
|:-:|:-|:-|:-|:-:|:-:|
| B-01 | LawyerSchedule entity validation | `LawyerSchedule.java` | Thêm @NotNull, @Min/Max validation | S | — |
| B-02 | LawyerScheduleRepository | `LawyerScheduleRepository.java` | Thêm findByLawyerId, saveBatch | S | — |
| B-03 | LawyerScheduleService | `LawyerScheduleService.java` (MỚI) | Logic business cho schedule CRUD | M | B-02 |
| B-04 | LawyerScheduleController | `LawyerScheduleController.java` (MỚI) | 4 endpoints schedule | M | B-03 |
| B-05 | AppointmentHistory entity | `AppointmentHistory.java` (MỚI) | Entity + repository | S | V8 migration |
| B-06 | BookingHistoryService | `BookingHistoryService.java` (MỚI) | CRUD history, auto-create on appointment change | M | B-05 |
| B-07 | BookingReminderService | `BookingReminderService.java` (MỚI) | Get/update reminder config | S | — |
| B-08 | BookingStatsService | `BookingStatsService.java` (MỚI) | Stats query + today appointments | M | — |
| B-09 | BookingController mở rộng | `BookingController.java` | Thêm GET/PATCH reminders, GET history, stats endpoint | M | B-06, B-07, B-08 |
| B-10 | Migration V8 | `V8__booking_erp_extend.sql` | Schema changes | S | B-05 |

## Phase 8B — Frontend (Tasks F-01 → F-12)

| # | Task | File | Mô tả | Effort | Phụ thuộc |
|:-:|:-|:-|:-|:-:|:-:|
| F-01 | admin-booking.ts wire API | `lib/api/admin-booking.ts` | Thay mock → real API calls | M | B-04, B-09 |
| F-02 | use-bookings.ts → TanStack Query | `pages/bookings/hooks/use-bookings.ts` | Thay useMockQuery → useQuery | S | F-01 |
| F-03 | use-availability.ts → TanStack Query | `pages/bookings/hooks/use-availability.ts` | Thay mock → useQuery | S | F-01 |
| F-04 | use-booking-mutations.ts → TanStack Query | `pages/bookings/hooks/use-booking-mutations.ts` | Thay MockDB → useMutation | M | F-01 |
| F-05 | bookings-calendar.tsx wire API | `pages/bookings/components/bookings-calendar.tsx` | Thay mock → bookingApi.calendar() | S | F-02 |
| F-06 | booking-availability-view.tsx wire API | `pages/bookings/components/booking-availability-view.tsx` | Thay mock → lawyerScheduleApi + calendar | S | F-01, F-03 |
| F-07 | booking-detail-drawer.tsx — tab Reminder | `pages/bookings/components/booking-detail-drawer.tsx` | Thêm tab Reminder config | M | F-01 |
| F-08 | booking-detail-drawer.tsx — tab Lịch sử | `pages/bookings/components/booking-detail-drawer.tsx` | Thêm tab Lịch sử | M | F-01 |
| F-09 | booking-form.tsx wire API | `pages/bookings/components/booking-form.tsx` | Dùng lawyerScheduleApi.getAll() cho slot picker | S | F-01 |
| F-10 | Tích hợp Booking → Lead | `pages/bookings/hooks/use-booking-mutations.ts` | Khi complete → tạo lead (API) | S | F-04 |
| F-11 | Type alignment | `types/` | Đảm bảo type match với API response | S | F-01 |
| F-12 | Build verification | — | `npm run build` exit 0 | S | F-01..F-11 |

---

# 06. LỘ TRÌNH TRIỂN KHAI

```
Phase 8A — Backend (2 ngày)
──────────────────────────────────────────────────────────────
Ngày 1 (Sáng)
├── B-01: LawyerSchedule entity validation         2h
├── B-02: LawyerScheduleRepository                  1h
├── B-03: LawyerScheduleService                     3h
└── B-04: LawyerScheduleController                  3h

Ngày 1 (Chiều) + Ngày 2 (Sáng)
├── B-05: AppointmentHistory entity                  1h
├── B-06: BookingHistoryService                      3h
├── B-07: BookingReminderService                     2h
└── B-08: BookingStatsService                        2h

Ngày 2 (Chiều)
├── B-09: BookingController mở rộng                3h
└── B-10: Migration V8                               1h

Phase 8B — Frontend (2 ngày)
──────────────────────────────────────────────────────────────
Ngày 3 (Sáng)
├── F-01: admin-booking.ts wire API                  3h
└── F-02: use-bookings.ts → TanStack Query           2h

Ngày 3 (Chiều)
├── F-03: use-availability.ts → TanStack Query       2h
├── F-04: use-booking-mutations.ts → TanStack Query   3h
└── F-05: bookings-calendar.tsx wire API              2h

Ngày 4 (Sáng)
├── F-06: booking-availability-view.tsx wire API     2h
├── F-07: booking-detail-drawer.tsx — tab Reminder    3h
└── F-08: booking-detail-drawer.tsx — tab Lịch sử    3h

Ngày 4 (Chiều)
├── F-09: booking-form.tsx wire API                  2h
├── F-10: Booking → Lead integration                  2h
├── F-11: Type alignment                              1h
└── F-12: Build verification                          1h
```

---

# 07. DEFINITION OF DONE

| # | Tiêu chí | Cách verify |
|:-:|:-|:-|
| 1 | Backend: Tất cả 10 endpoint trả về 200/201 | Manual test bằng Postman |
| 2 | Backend: Unit test cho service layer | `./mvnw test` exit 0 |
| 3 | Backend: Migration chạy thành công | Database verify tables |
| 4 | Frontend: Booking page load không có mock | Network tab không có localStorage |
| 5 | Frontend: Calendar hiển thị events từ API | Verify data match |
| 6 | Frontend: Availability view đúng slots | Verify hiển thị |
| 7 | Frontend: Reminder config lưu + đọc đúng | Toggle + reload |
| 8 | Frontend: Lịch sử booking hiển thị | Verify timeline |
| 9 | Frontend: Tạo booking → lead hoạt động | Create flow |
| 10 | Frontend: `npm run build` exit 0 | Build verification |
| 11 | Frontend: `tsc --noEmit` exit 0 | Type check |
| 12 | Frontend: Không `console.log` trong code mới | Code review |

---

# 08. CẤU TRÚC FILE

## Backend — Files mới / sửa

```
src/main/java/com/lawfirm/brs/
├── controller/admin/
│   └── LawyerScheduleController.java           [MỚI]
│
├── dto/request/
│   ├── LawyerScheduleRequest.java               [MỚI]
│   ├── LawyerScheduleOverrideRequest.java      [MỚI]
│   └── BookingReminderConfigRequest.java       [MỚI]
│
├── dto/response/
│   ├── LawyerScheduleDTO.java                  [MỚI]
│   ├── LawyerScheduleOverrideDTO.java         [MỚI]
│   ├── BookingStatsDTO.java                    [MỚI]
│   └── BookingHistoryDTO.java                 [MỚI]
│
├── entity/
│   └── AppointmentHistory.java                [MỚI]
│
├── repository/
│   ├── LawyerScheduleRepository.java          [SỬA - thêm methods]
│   └── AppointmentHistoryRepository.java      [MỚI]
│
└── service/
    ├── LawyerScheduleService.java             [MỚI]
    ├── BookingHistoryService.java             [MỚI]
    ├── BookingReminderService.java            [MỚI]
    └── BookingStatsService.java               [MỚI]
```

## Frontend — Files mới / sửa

```
src/lib/api/
└── admin-booking.ts                          [SỬA - thêm API calls]

src/features/admin/pages/bookings/
├── hooks/
│   ├── use-bookings.ts                       [SỬA - TanStack Query]
│   ├── use-availability.ts                   [SỬA - TanStack Query]
│   └── use-booking-mutations.ts              [SỬA - TanStack Query]
└── components/
    ├── bookings-calendar.tsx                  [SỬA - wire API]
    ├── booking-availability-view.tsx         [SỬA - wire API]
    ├── booking-form.tsx                       [SỬA - wire API]
    └── booking-detail-drawer.tsx              [SỬA - thêm tabs]
```

---

# 09. PHỤ LỤC — API Response DTOs

```java
// LawyerScheduleDTO.java
public record LawyerScheduleDTO(
    UUID id,
    UUID lawyerId,
    int dayOfWeek,
    boolean isOff,
    List<TimeSlot> slots,
    LocalDate effectiveFrom,
    LocalDate effectiveTo,
    String note
) {
    public record TimeSlot(String start, String end) {}
}

// LawyerScheduleOverrideDTO.java
public record LawyerScheduleOverrideDTO(
    UUID id,
    UUID lawyerId,
    LocalDate overrideDate,
    String type, // "off" | "custom"
    List<TimeSlot> slots,
    String reason,
    LocalDateTime createdAt
) {}

// BookingStatsDTO.java
public record BookingStatsDTO(
    LocalDate date,
    long total,
    long pending,
    long confirmed,
    long completed,
    long cancelled,
    List<AppointmentDTO> todayAppointments
) {}

// BookingHistoryDTO.java
public record BookingHistoryDTO(
    UUID id,
    UUID appointmentId,
    String type,
    String fromValue,
    String toValue,
    String reason,
    UUID actorId,
    String actorName,
    LocalDateTime createdAt
) {}

// BookingReminderConfigDTO.java
public record BookingReminderConfigDTO(
    UUID appointmentId,
    List<ReminderConfig> reminders
) {
    public record ReminderConfig(String type, boolean enabled, String channel) {}
}
```
