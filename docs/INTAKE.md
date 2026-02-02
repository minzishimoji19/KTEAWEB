INTAKE
Movie Ticket Loyalty & Revenue Management Web App
1. Thông tin chung
Tên dự án: (tạm gọi) Movie Ticket Loyalty System


Loại sản phẩm: Web App nội bộ (Admin/Operator Dashboard)


Mục đích sử dụng: Quản lý khách hàng, giao dịch đặt vé phim, tích điểm – xếp hạng thành viên, theo dõi doanh thu và quản lý voucher.



2. Bối cảnh & Vấn đề hiện tại
Hiện tại dịch vụ đặt vé phim được vận hành chủ yếu thủ công:
Thông tin khách hàng và lịch sử mua vé phân tán, khó tổng hợp.


Không có hệ thống chuẩn để:


theo dõi doanh thu theo thời gian,


đo hiệu quả khách hàng trung thành,


quản lý điểm thưởng và hạng thành viên.


Voucher/khuyến mãi phải tự săn và lưu trữ rời rạc, dễ bỏ lỡ cơ hội tốt.


=> Cần một hệ thống tập trung, nhập liệu đơn giản nhưng logic tính toán tự động, giúp chủ dịch vụ:
kiểm soát tài chính,


hiểu hành vi khách hàng,


tối ưu chương trình loyalty và ưu đãi.



3. Mục tiêu sản phẩm (Product Goals)
Quản lý toàn bộ vòng đời khách hàng:


từ lúc khởi tạo → mua vé → tích điểm → lên hạng.


Tự động hóa logic tích điểm & xếp hạng, tránh tính tay.


Cung cấp dashboard realtime để theo dõi:


doanh thu,


số vé,


chất lượng tệp khách hàng.


Tạo nền tảng để mở rộng automation voucher trong tương lai.



4. Đối tượng sử dụng (Users)
Nhóm
Mô tả
Admin
Chủ hệ thống, toàn quyền cấu hình, xem báo cáo










5. Phạm vi chức năng (Functional Requirements)
5.1 Quản lý khách hàng (Customer Management)
Mục đích
Khởi tạo và lưu trữ thông tin khách hàng làm nền cho mọi nghiệp vụ sau.
Thông tin cần nhập
Số điện thoại (unique – không trùng)


Tên khách hàng


Mối quan hệ (bạn bè, người quen, khách VIP…)


Số tài khoản ngân hàng


Rank game (theo phân loại nội bộ)


Yêu cầu bổ sung để vận hành ổn định
Trạng thái: Active / Inactive


Ghi chú nội bộ


Ngày tạo & người tạo


➡️ Chức năng này chỉ dùng để khởi tạo dữ liệu khách hàng ban đầu vào Database.

5.2 Nhập thông tin mua hàng / giao dịch (Transaction Entry)
Mục đích
Ghi nhận mỗi lần khách hàng mua vé để:
tính doanh thu,


kích hoạt tích điểm,


làm dữ liệu cho dashboard.


Thông tin cần nhập
Khách hàng (liên kết bằng SĐT)


Số tiền nhận được


Số vé đã mua


Ngày mua vé


Loại sản phẩm:


Vé xem phim


Combo bắp nước


Kênh mua:


App


Web


Offline


Tên phim


Voucher áp dụng (nếu có)


Ảnh chuyển khoản hoặc xác nhận đã mua vé


Trạng thái giao dịch
Pending (chờ xác nhận)


Confirmed (đã mua thành công)


Rejected (hủy / sai)


Quy tắc quan trọng
Chỉ giao dịch Confirmed mới:


ghi nhận doanh thu,


kích hoạt tích điểm,


ảnh hưởng đến hạng thành viên.



5.3 Hệ thống tích điểm (Loyalty Program)
Nguyên tắc thiết kế
Đơn giản, dễ hiểu cho người vận hành.


Linh hoạt để điều chỉnh sau này.


Cân bằng giữa chi phí và giá trị cảm nhận của khách hàng.


Cơ chế tích điểm
Quy đổi cơ bản:
 10,000 VNĐ = 1 điểm (có thể cấu hình)


Phân loại:


Vé xem phim: tích điểm cơ bản (~5%)


Combo bắp nước: tích điểm cao hơn (7–10%)


Bonus:


Đặt vé qua App/Web được thưởng thêm điểm.


Cách vận hành
Sau khi giao dịch được Confirmed:


hệ thống tự động tính điểm,


ghi vào sổ điểm (Point Ledger),


cộng vào tổng điểm khách hàng.


Điểm hết hạn
Điểm có thời hạn sử dụng 1 năm kể từ ngày tích.


Điểm hết hạn sẽ tự động bị trừ.



5.4 Hệ thống hạng thành viên (Membership Tiers)
Mục tiêu
Tạo động lực để khách hàng quay lại và tăng chi tiêu.
Hạng thành viên
Hạng
Điều kiện (ví dụ)
Quyền lợi
Bronze
Đăng ký
Tích điểm cơ bản
Silver
> 2 triệu / năm
Tích điểm cao hơn
Gold
> 5 triệu / năm
Đổi điểm vé, giảm giá
Diamond
> 10 triệu / năm
Đặc quyền VIP

Quy tắc
Xét hạng theo rolling 12 tháng.


Hạng được cập nhật tự động sau mỗi giao dịch Confirmed.



5.5 Dashboard quản lý doanh số & loyalty
1. Chỉ số tổng quát
Tổng doanh thu (Gross / Net)


Số vé đã bán


Số khách hàng mới


Tổng điểm đang lưu hành


2. Phân tích doanh thu
Line chart: doanh thu theo ngày/tuần/tháng


Pie chart:


Vé vs Combo


Kênh thanh toán


Bar chart:


Top phim doanh thu


3. Loyalty Insights
Phân bổ hạng thành viên


Tỷ lệ đổi điểm


Retention rate


LTV (giá trị vòng đời khách hàng)


4. Vận hành & cảnh báo
Giao dịch pending


Top khách chi tiêu cao


Voucher sắp hết hạn



5.6 Quản lý Voucher (Phase 1 – Manual)
Chức năng
Lưu trữ và tìm kiếm voucher.


Theo dõi trạng thái còn / sắp hết / hết hạn.


Thông tin voucher
Mã voucher


Ưu đãi


Nền tảng (CGV, MoMo, ZaloPay…)


Ngày hết hạn


Nguồn (Manual / Bot – sau này)



6. Phạm vi KHÔNG bao gồm (Out of Scope – giai đoạn hiện tại)
Thanh toán realtime & webhook ngân hàng.


Automation săn voucher + validate tự động.


App/mobile cho khách hàng.


Tính tỷ lệ lấp đầy ghế (Occupancy Rate).



7. Giả định & ràng buộc
Người vận hành nhập dữ liệu thủ công.


MVP ưu tiên xài được – rõ số – không sai logic, chưa tối ưu UI fancy.


Voucher automation để phase sau.



8. Tiêu chí thành công (Success Criteria)
100% giao dịch Confirmed được:


tính doanh thu đúng,


tích điểm đúng,


xếp hạng chính xác.


Chủ dịch vụ có thể:


xem dashboard và hiểu tình hình trong < 1 phút.


Hệ thống đủ rõ ràng để mở rộng automation về sau.



