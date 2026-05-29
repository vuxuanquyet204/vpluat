# BRS Backend API - Postman Collection

Collection chứa **143 API endpoints** được tổ chức theo các danh mục sau:

## Cấu trúc Collection

### 1. Auth (8 endpoints)
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Làm mới token
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `PUT /api/auth/me` - Cập nhật profile
- `POST /api/auth/change-password` - Đổi mật khẩu
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Reset mật khẩu

### 2. Public APIs (30 endpoints)
- **Services** - Dịch vụ công khai
- **Lawyers** - Danh sách luật sư
- **Reviews** - Đánh giá công khai
- **FAQs** - Câu hỏi thường gặp
- **Posts** - Bài viết
- **Search** - Tìm kiếm
- **Documents** - Tài liệu công khai

### 3. CRM (27 endpoints)
- **Leads** - Quản lý khách hàng tiềm năng
- **Jobs** - Tin tuyển dụng (công khai + admin)
- **Newsletter** - Đăng ký nhận tin
- **Reviews (Admin)** - Quản lý đánh giá

### 4. Admin (71 endpoints)
- **Dashboard** - Thống kê tổng quan
- **Users** - Quản lý người dùng
- **Lawyer Profiles** - Quản lý hồ sơ luật sư
- **Tags** - Quản lý tags
- **Categories** - Quản lý danh mục
- **Posts (Admin)** - Quản lý bài viết
- **Case Studies** - Nghiên cứu tình huống
- **Documents (Admin)** - Quản lý tài liệu
- **File Upload** - Upload file
- **Chatbot (Admin)** - Quản lý chatbot

### 5. Booking (11 endpoints)
- **Availability** - Quản lý lịch trống
- **Bookings** - Quản lý đặt lịch tư vấn

### 6. Chatbot (3 endpoints)
- `POST /api/chatbot/message` - Gửi tin nhắn
- `GET /api/chatbot/history/:sessionId` - Lịch sử chat
- `POST /api/chatbot/handoff` - Yêu cầu chuyển human

### 7. Webhooks (3 endpoints)
- `POST /api/webhooks/sms` - SMS delivery webhook
- `POST /api/webhooks/otp-callback` - OTP callback
- `GET /api/webhooks/health` - Health check

## Cách sử dụng

### 1. Import Collection
1. Mở Postman
2. Click **Import**
3. Chọn file `BRS_API_Postman_Collection.json`

### 2. Thiết lập Environment
Tạo environment với các biến:
- `baseUrl`: `http://localhost:8080`
- `accessToken`: Token sau khi login
- `refreshToken`: Refresh token

### 3. Chạy test
1. **Login** trước để lấy token (auto-set vào biến)
2. Các request khác sẽ tự động sử dụng Bearer token

## Authentication

### Public Endpoints
Không cần authentication:
- Auth APIs (login, refresh, forgot-password, reset-password)
- Public APIs (services, lawyers, reviews, FAQs, posts)
- Webhooks

### Protected Endpoints
Cần Bearer token:
- Admin APIs (prefix: `/api/admin/*`)
- CRM APIs (prefix: `/api/crm/*`)
- Booking APIs (prefix: `/api/bookings/*`)

## Roles

| Role | Description |
|------|-------------|
| `ADMIN` | Full admin access |
| `SUPER_ADMIN` | Super admin (user management) |
| `EDITOR` | Content editor access |
| `CSKH` | Customer service role |
| `authenticated` | Any logged-in user |

## API Response Format

```json
{
    "success": true,
    "data": { ... },
    "error": null
}
```

## Pagination

Các API có phân trang sử dụng query params:
- `page`: Page number (0-indexed)
- `size`: Page size (default: 20)

Response:
```json
{
    "content": [ ... ],
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
}
```

## Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## File Upload

Sử dụng `multipart/form-data`:
- `file`: File to upload
- `folder`: Optional folder path

## Notes

- Tất cả date/time sử dụng format ISO 8601: `2026-06-01T10:00:00Z`
- UUID được sử dụng cho các entity IDs
- Language mặc định: `vi` (Vietnamese)
- Timezone mặc định: `Asia/Ho_Chi_Minh`
