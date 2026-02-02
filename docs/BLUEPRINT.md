

BLUEPRINT — Movie Ticket Loyalty & Revenue System
1. Tổng quan kiến trúc (High-level Architecture)
Mô hình: Web App + Backend API + Database
Định hướng: Modular, dễ mở rộng (Voucher automation, Payment, Customer Portal sau này)
[ Web Admin UI ]
        |
        v
[ Backend API / Business Logic ]
        |
        v
[ Database ]
        |
        +--> [ File Storage ] (ảnh chuyển khoản)
        +--> [ Bot / Automation ] (Phase 2 - Voucher)


2. Phân rã Module (System Modules)
M1 — Authentication & Roles
Login
Role-based access:
Admin
Operator
Viewer
Audit log (ai làm gì, lúc nào)

M2 — Customer Management
Chức năng
Tạo / sửa / xem khách hàng
Search theo SĐT (primary key)
Entity: Customer
Field
Type
Note
id
UUID
PK
phone
string
unique
name
string


relationship
string


bank_account
string


game_rank
string


total_points
int
realtime
tier
enum
Bronze/Silver/Gold/Diamond
created_at
datetime


status
enum
Active/Inactive
note
text




M3 — Transaction / Purchase
Chức năng
Nhập giao dịch mua vé
Upload ảnh chuyển khoản
Confirm / Reject
Entity: Transaction
Field
Type
Note
id
UUID


customer_id
FK


amount_gross
number
trước giảm
amount_net
number
sau giảm
ticket_count
int


purchase_date
date


product_type
enum
Ticket / Combo
channel
enum
App / Web / Offline
movie_name
string


branch
string
optional
voucher_code
string
optional
proof_image_url
string


status
enum
Pending / Confirmed / Rejected
created_by
user_id


created_at
datetime



Rule
Chỉ khi Confirmed:
Cộng doanh thu
Kích hoạt tích điểm
Cập nhật tier

M4 — Loyalty Engine (Core Logic)
4.1 Rule Configuration
Entity: PointRule
Field
Note
conversion_unit
10000
ticket_multiplier
0.05
combo_multiplier
0.07–0.10
app_web_bonus
+x%
member_day_multiplier
optional

Cho phép chỉnh trong Admin UI

4.2 Point Ledger (bắt buộc – KHÔNG cộng trừ trực tiếp)
Entity: PointLedger
Field
Note
id


customer_id


transaction_id
nullable
points
+ / -
type
Earn / Redeem / Expire
expired_at
datetime
rule_snapshot
JSON
created_at



➡️ total_points = SUM(PointLedger.points WHERE not expired)

M5 — Tier Engine
Entity: TierHistory
Field
Note
customer_id


tier
Bronze/Silver/Gold/Diamond
from_date


to_date
nullable

Logic
Rolling 12 months
Trigger sau mỗi transaction Confirmed
Tier thresholds:
Silver > 2M
Gold > 5M
Diamond > 10M

M6 — Dashboard & Analytics
6.1 KPI Cards
Gross Revenue
Net Revenue
Tickets Sold
New Customers
Points in circulation
6.2 Charts
Line: Revenue theo ngày/tuần/tháng
Pie:
Ticket vs Combo
Channel breakdown
Bar: Top phim doanh thu
6.3 Loyalty Insights
Tier distribution
Redemption rate
Retention rate
LTV

M7 — Voucher Management (Phase 1: Manual)
Entity: Voucher
Field
Note
code


discount


platform
CGV / MoMo / etc
expiry_date


status
Active / Expiring / Exhausted
source
Manual / Bot
updated_at



Chức năng
CRUD
Search / Filter
Alert voucher sắp hết hạn

M8 — Voucher Automation (Phase 2 – Optional)
Pipeline
Crawler → Pending_Voucher → Validation → Active_Voucher → Alert

Scrape website
Monitor Telegram
Regex / LLM extraction
Manual approve trước khi active (an toàn)

3. Luồng nghiệp vụ chính (Critical Flows)
Flow A — Khởi tạo & mua vé
Tạo Customer
    ↓
Nhập Transaction (Pending)
    ↓
Confirm Transaction
    ↓
+ Revenue
+ PointLedger(Earn)
+ Tier re-evaluate


Flow B — Đổi điểm
Create Redemption
    ↓
PointLedger(Redeem -)
    ↓
Update total_points


Flow C — Voucher lifecycle
Create / Import Voucher
    ↓
Active
    ↓
Expiring Soon Alert
    ↓
Expired / Exhausted


4. UI Screens (Web Admin)
Login
Dashboard (Home)
Customers
List
Detail (Profile + Transactions + Points)
Transactions
Pending Queue
History
Loyalty
Rules config
Tier overview
Vouchers
Reports / Export
Settings

5. Non-functional (Gate kỹ thuật)
Không hard-code rule tích điểm
Không cộng điểm trực tiếp vào Customer
Mọi điểm đi qua PointLedger
Transaction không Confirm → không có tác dụng
Có audit log cho confirm/reject/redeem

