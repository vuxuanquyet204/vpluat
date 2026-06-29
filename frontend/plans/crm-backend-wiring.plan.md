# Plan: CRM Lead Management → Backend Integration

## Muc tieu
Ket noi trang CRM Lead Management voi backend endpoints, loai bo MockDB, dam bao tat ca chuc nang hoat dong dung.

## Ket qua mong muon
- Trang `/admin/crm` hoan toan dung backend API
- MockDB da duoc loai bo khoi trang CRM
- TypeScript: 0 loi
- Build: thanh cong

---

## Cong viec da hoan thanh

### 1. Tao hooks `use-leads.ts` — DONE
**File:** `src/features/admin/lib/use-leads.ts`

Tao cac hooks:
- `useLeads(params)` — list leads voi pagination
- `useLead(id)` — single lead
- `useLeadTimeline(id)` — lead timeline
- `useLeadStats(params)` — aggregated stats
- `useLeadSourceCounts(params)` — source distribution
- `useUpdateLead()` — update status/notes
- `useDeleteLead()` — soft delete
- `useDeleteManyLeads()` — bulk delete
- `useAddLeadNote()` — add note
- `useBulkUpdateStatus()` — bulk status change
- `useBulkAssign()` — assign by UUID
- `useBulkAssignByName()` — assign by full name

### 2. Export hooks — DONE
**File:** `src/features/admin/lib/index.ts`

Export tat ca hooks moi vao barrel export.

### 3. Refactor `crm/index.tsx` — DONE
- Thay `useMockQuery` → `useLeads`
- Thay `MockDB.insert` → `useUpdateLead`
- Thay `useUpdate` → `useUpdateLead`
- Thay `useDelete` → `useDeleteLead`
- Thay `useDeleteMany` → `useDeleteManyLeads`
- Them `useBulkUpdateStatus`, `useBulkAssignByName`
- Xu ly UPPERCASE ↔ lowercase status mapping
- Xu ly `assignedTo` object → name string

### 4. Refactor `LeadDetailDrawer` — DONE
**File:** `src/features/admin/pages/crm/components/lead-detail-drawer.tsx`
- Loai bo MockDB, su dung `useLeadTimeline`, `useUpdateLead`, `useDeleteLead`
- Mapping backend timeline → frontend format
- Quick status change buttons dung API

### 5. Refactor `LeadNotes` — DONE
**File:** `src/features/admin/pages/crm/components/lead-notes.tsx`
- Loai bo MockDB
- Dung `useAddLeadNote` hook

### 6. Refactor `LeadsTable` — DONE
**File:** `src/features/admin/pages/crm/components/leads-table.tsx`
- Dung `Lead` type tu `lib/api/admin-crm` (thay vi `types/index`)
- `serviceName` thay vi `service`
- `assignedTo?.fullName` thay vi `assignedTo` string
- `status as LeadStatus` cast

### 7. Refactor `LeadForm` + `LeadQuickEdit` — DONE
- Dung `Lead` type tu backend
- Xu ly UPPERCASE ↔ lowercase mapping
- Xu ly `assignedTo` object → name string

### 8. Fix bookings `useLawyers` type conflict — DONE
**File:** `src/features/admin/pages/bookings/hooks/use-lawyers.ts`
- Dung `Lawyer` type tu `types/index` (co `serviceIds`, `createdAt`)
- Loai bo local `Lawyer` interface trung ten

### 9. TypeScript check — DONE
- `npx tsc --noEmit` → **0 loi**

---

## Backend endpoints da su dung

| Endpoint | Method | Hook |
|---|---|---|
| `/api/crm/leads` | GET | `useLeads` |
| `/api/crm/leads/{id}` | GET | `useLead` |
| `/api/crm/leads/{id}` | PATCH | `useUpdateLead`, `useBulkAssignByName` |
| `/api/crm/leads/{id}` | DELETE | `useDeleteLead` |
| `/api/crm/leads/{id}/timeline` | GET | `useLeadTimeline` |
| `/api/crm/leads/{id}/assign` | PATCH | `useBulkAssign` |

---

## Ghi chu ky thuat

### Status mapping
Backend: `NEW | CONTACTED | PROGRESS | WON | LOST`
Frontend: `new | contacted | progress | converted | lost`

```typescript
const BE_STATUS: Record<string, string> = {
  new: 'NEW', contacted: 'CONTACTED', progress: 'PROGRESS',
  converted: 'WON', lost: 'LOST',
};
const FE_STATUS: Record<string, LeadStatus> = {
  NEW: 'new', CONTACTED: 'contacted', PROGRESS: 'progress',
  WON: 'converted', CONVERTED: 'converted', LOST: 'lost',
};
```

### `assignedTo` mapping
Backend DTO: `assignedTo: { id: string; fullName: string }`
Frontend form/display: `string` (fullName)

### `service` mapping
Backend DTO: `serviceName: string`
Frontend table/form: `serviceName: string` (da update)

---

## Hanh dong tiep theo

1. **Test end-to-end** — Dang nhap admin, vao `/admin/crm`, kiem tra:
   - Danh sach lead hien thi dung tu backend
   - Phan trang hoat dong
   - Tao/Sua/Xoa lead
   - Doi trang thai, ghi chu
   - Bulk actions
   - Export CSV

2. **Kanban Pipeline** (`/admin/crm/pipeline`) — Can kiem tra xem co can refactor tuong tu

3. **Loai bo MockDB** khoi cac trang con lai (neu can)
