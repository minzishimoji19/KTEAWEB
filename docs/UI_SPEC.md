UI SPEC — Movie Ticket Loyalty & Revenue Web App (MVP)
0) Nguyên tắc UI (Non-negotiables)
3 click rule: từ Dashboard → tới bất kỳ dữ liệu cần xử lý ≤ 3 click.


Speed-first: Pending transactions xử lý nhanh (confirm/reject) là ưu tiên #1.


Readable numbers: số liệu to, rõ, ít màu.


One purpose per screen: mỗi màn chỉ trả lời 1 câu hỏi.


No dead ends: mọi list đều có link đi tiếp (detail / edit).



1) Global Layout
1.1 App Shell
Top bar


App name


Global date filter (Today / 7 days / This month / Custom)


Search nhanh (SĐT / tên / mã voucher)


User menu (role, logout)


Left Sidebar (fixed)


Dashboard


Customers


Transactions


Loyalty


Vouchers


Reports (optional MVP)


Settings


1.2 Design tokens (để thống nhất UI)
Font: Inter/Roboto, size base 14–16


Card radius 12–16


Table row height 44–52


Status colors:


Success (Confirmed/Active): xanh


Warning (Pending/Expiring): cam


Danger (Rejected/Expired/Exhausted): đỏ


Badges: Tier badge (Bronze/Silver/Gold/Diamond) rõ ràng, không gradient.



2) Screens & Components (MVP)
2.1 Dashboard (Home)
Mục tiêu
Nhìn 10 giây biết: tiền – vé – khách – điểm, và việc cần xử lý.
Layout
A. Filters bar (top)
Time filter (default: This month)


(Optional) Branch filter (ẩn nếu chưa dùng)


B. KPI Cards (row 1)
 5 cards:
Gross Revenue


Net Revenue


Tickets Sold


New Customers


Points Circulating


Card spec
Primary value (to)


Secondary: % change vs previous period


Click card → mở Reports/Transactions list đã filter


C. Charts (row 2)
Left (70%): Line chart “Revenue over time”


Right (30%): Pie chart “Revenue split Ticket vs Combo”


Row 3:


Bar chart “Top 5 Movies by revenue”


Mini chart “Channel split (App/Web/Offline)” (optional)


D. Operations & Alerts (row 4)
 3 widgets dạng list:
Pending Transactions (top 10)


columns: Customer, Amount, Proof icon, Age, Action


Action: Confirm / Reject


Vouchers Expiring Soon (top 10)


code, platform, expiry date, status


Top Customers (top 10)


name/phone, spend, tier, points


Empty state
Nếu chưa có data: hiển thị CTA “Add first customer / Add first transaction”.



2.2 Customers
2.2.1 Customer List
Mục tiêu: tìm khách trong 3 giây.
Header
Search: SĐT / tên


Buttons:


Add Customer


Export CSV (optional MVP)


Table columns
Phone (clickable)


Name


Tier badge


Total spend (rolling 12m)


Points available


Last purchase date


Status


Row actions (kebab)
Edit


Deactivate


2.2.2 Customer Detail (Profile)
Mục tiêu: 1 trang thấy đủ “khách này đáng chăm không”.
Top summary (3 blocks)
Block 1: Info (name, phone, relationship, bank account, rank)


Block 2: Loyalty snapshot


Tier + progress bar tới tier tiếp theo


Points available


Points expiring in 30 days


Block 3: Spend snapshot


Spend 30d / 90d / 12m


#transactions / #tickets


Tabs
Transactions


list + filter Confirmed/Pending/Rejected


Points (Ledger)


Earn/Redeem/Expire list


Notes (optional MVP)



2.3 Transactions
2.3.1 Transactions List
Header
Filters: Status, Type (Ticket/Combo), Channel, Date range


Buttons:


Add Transaction


Bulk confirm (phase 2)


Table columns
Date


Customer (click)


Amount gross / net


Tickets


Type


Channel


Status badge


Proof icon


Actions


2.3.2 Pending Queue (Dedicated)
Mục tiêu: Operator xử lý nhanh.
Layout
Left: Pending table


Right: Preview panel (khi click 1 row)


proof image lớn


transaction fields


Confirm / Reject buttons to, fixed bottom


Hotkeys (nice-to-have)
Enter = Confirm


Esc = Reject


2.3.3 Add/Edit Transaction (Form)
Required fields
Customer (search by phone)


Amount received (gross)


Discount (optional) → auto net


Tickets


Purchase date


Product type


Channel


Movie name


Voucher code (optional)


Proof upload OR “Confirmed without proof” toggle


Status default: Pending


Validation
amount > 0


tickets >= 1


date not empty


customer required



2.4 Loyalty
2.4.1 Loyalty Overview
Widgets:
Tier distribution (pie)


Redemption rate


Points issued vs redeemed (bar)


Points expiring soon (list)


2.4.2 Rules Config (Admin only)
Fields:
Conversion unit: 10,000 VND = 1 point


Ticket multiplier (%)


Combo multiplier (%)


App/Web bonus (%)


Points expiry: 12 months


Tier thresholds: 2M / 5M / 10M
 Button:


Save changes


Warning banner: “Rules apply to future transactions only.”


2.4.3 Redemption (MVP minimal)
Create redemption:


customer


points to redeem


note (redeem for ticket/combo)


shows points before/after



2.5 Vouchers (Manual MVP)
Voucher List
Header
Search by code/platform


Filters: status, platform, expiry range


Add Voucher


Table columns
Code (copy button)


Discount


Platform


Status badge (Active/Expiring/Expired/Exhausted)


Expiry date


Updated at


Source (Manual)


Voucher Detail/Edit
Full fields + notes


“Mark exhausted” action



2.6 Settings (MVP)
Users & Roles (simple)


Branch list (optional hidden)


Data backup/export (optional)



3) Component Specs (Reusable)
3.1 Badge
TierBadge: Bronze/Silver/Gold/Diamond


StatusBadge: Pending/Confirmed/Rejected + Voucher status


3.2 Tables
Sticky header


Row click opens detail


Kebab menu for secondary actions


3.3 Proof Image Viewer
Click to open modal full-screen


Download disabled/enabled (tuỳ bạn, default enabled)


3.4 Global Search
Query types:


Phone: direct to customer profile


Voucher code: direct to voucher detail


Movie name: show filtered transactions



4) Responsive behavior
Desktop-first


Tablet: sidebar collapsible


Mobile: read-only view (optional), MVP vẫn ưu tiên desktop



5) UI Acceptance Criteria (Gates cho UI)
Dashboard mở lên ≤ 2s (data nhỏ)


Pending queue xử lý 10 giao dịch ≤ 60s (UX đủ nhanh)


Search SĐT ra kết quả ≤ 1s


Không cần quá 2 màn để Confirm 1 giao dịch


Không có màn nào “trống” mà không có CTA hoặc hướng dẫn



6) UI Tasks theo Sprint (để Scrum chạy)
Sprint 0: App shell + sidebar + auth screens + empty states


Sprint 1: Customers list + detail + transaction form + pending queue


Sprint 2: Loyalty overview + rules config + redemption form


Sprint 3: Dashboard charts + voucher module

