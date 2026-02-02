CONTRACT — Movie Ticket Loyalty & Revenue Web App
1) Mục tiêu hợp đồng
Xây web app nội bộ giúp bạn:
Quản lý khách hàng + giao dịch mua vé/combos


Tự động tích điểm + xét hạng


Xem dashboard doanh thu & loyalty


Quản lý voucher (manual) ở MVP


Chuẩn bị nền cho Voucher Automation Phase 2


2) Phạm vi bàn giao (Scope of Delivery)
MVP (In scope)
A. Customer
CRUD khách hàng: SĐT (unique), Tên, Mối quan hệ, STK, Rank game


Tìm kiếm nhanh theo SĐT/tên


Hồ sơ khách: lịch sử giao dịch + điểm + hạng


B. Transaction
Tạo giao dịch: amount, số vé, ngày mua, loại (Ticket/Combo), kênh (App/Web/Offline), phim, voucher (optional)


Upload ảnh chuyển khoản / xác nhận mua


Queue Pending + Confirm/Reject


Chỉ Confirmed mới tính doanh thu + điểm


C. Loyalty
PointRule cấu hình (conversion + multipliers + bonus)


PointLedger (Earn/Redeem/Expire) + snapshot rule


Tier engine rolling 12m (Bronze/Silver/Gold/Diamond) theo ngưỡng bạn đưa


Redemption manual (tối thiểu để có redemption rate)


D. Dashboard
KPI: Gross/Net revenue, tickets sold, new customers, points in circulation


Charts: line revenue, pie breakdown, bar top phim


Loyalty insights: tier distribution, redemption rate, retention basic, LTV basic


Operations: pending transactions, top customers, voucher expiring


E. Voucher (Manual)
CRUD voucher + search/filter


Trạng thái + cảnh báo hết hạn


Out of scope (Phase 2 / Future)
Crawler & auto-validation voucher “giả lập đặt vé”


Payment webhook realtime


Portal cho khách tự xem điểm


Occupancy Rate (vì thiếu dữ liệu ghế/suất chiếu)


3) Nguyên tắc “không nổ scope”
Bất kỳ yêu cầu mới ngoài mục “MVP In scope” → tạo Change Request:


cập nhật CONTRACT


thêm ticket & estimate


sắp vào sprint sau


4) Definition of Done (DoD) chung
Một hạng mục được xem là DONE khi:
Có UI hoạt động + validation cơ bản


Có lưu DB đúng schema


Có test case tối thiểu (happy path + 1 edge case)


Không phá flow chính:


Confirm giao dịch → cộng điểm/tier đúng


Ledger không âm điểm


Có log/audit cho hành động nhạy cảm (confirm/reject/redeem)


5) Acceptance Criteria “load-bearing” (quan trọng nhất)
SĐT unique: không tạo trùng khách


Pending vs Confirmed: chỉ Confirmed mới:


ghi nhận doanh thu dashboard


cộng điểm


update tier


PointLedger bắt buộc: không cộng/trừ trực tiếp vào field customer


Rule snapshot: đổi rule không làm sai lịch sử


Filter dashboard: Today / 7 days / This month cho số ra đúng



Sprint Plan (Scrum)
Sprint 0 — Foundation (Setup)
Sprint Goal: dựng khung app + auth + schema
 Deliverables
Login + roles (Admin/Operator/Viewer)


Database schema: Customer, Transaction, PointRule, PointLedger, TierHistory, Voucher, AuditLog


Layout/navigation cơ bản


Sprint 1 — Customer + Transaction MVP
Sprint Goal: nhập khách + nhập giao dịch + confirm/reject
 Deliverables
Customer CRUD + search


Transaction create + upload proof + pending queue


Confirm/Reject + audit log


Customer profile: transaction history


Sprint 2 — Loyalty Engine
Sprint Goal: tự tính điểm + tier + redemption tối thiểu
 Deliverables
PointRule config UI


Auto earn points on confirm


Expiration logic (1 năm)


Tier engine rolling 12m


Redemption manual → ledger trừ điểm


Sprint 3 — Dashboard + Voucher Manual
Sprint Goal: dashboard “xài được ngay” + voucher module
 Deliverables
KPI cards + time filters


Charts revenue + breakdown + top phim


Loyalty insights (tier distribution, redemption rate, retention, LTV)


Voucher CRUD + expiring alerts


Pending transactions widget



GATES — Checklist kiểm tra trước khi Pass
GATE 1 — Intake Pass
Mục tiêu rõ


Scope MVP rõ


Out-of-scope rõ


GATE 2 — Blueprint Pass
Có module map


Có data model + ledger


Có flow nghiệp vụ chính


GATE 3 — Contract Pass
Acceptance criteria


DoD


Sprint plan + scope control


GATE 4 — Build Ready
Chọn stack (frontend/backend/db) (mặc định có thể chọn nhanh khi thi công)


Repo + structure docs/src/jobs


Seed data + staging env



