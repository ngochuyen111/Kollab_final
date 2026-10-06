# Kollab — bản nâng cấp dashboard, outcome, ảnh và thông báo

## Bản vá lỗi join và notifications 404

Bản vá mới chuẩn hóa các join payments/published_posts/draft_submissions/performance_metrics khi Supabase trả object, array hoặc null. Không sửa constraint hoặc xóa khoản thanh toán. Mọi phương thức đọc task đều chuẩn hóa trước khi đưa vào dashboard/outcome/KOL portal.

Nếu console báo `notifications 404`, chạy `supabase/enhancements.sql` rồi `supabase/demo_access.sql` trong SQL Editor của đúng project đang dùng. Migration mới có thông báo reload schema cache. Nếu vẫn 404, kiểm tra bằng `select to_regclass('public.notifications');` (kết quả phải là notifications), rồi chạy `notify pgrst, 'reload schema';` và bấm Làm mới ở chuông.

Không chạy lại reset/seed để sửa lỗi này: file reset có DELETE dữ liệu và không tạo bảng notifications. Gói source này không tự chạy SQL lên database thật. Khi bảng/cột thông báo chưa có, frontend hiện hướng dẫn và dừng tự polling cho tới khi người dùng bấm Làm mới; dashboard vẫn dùng được.

Có thể chép đúng bốn file sau từ bản ZIP mới sang bản nâng cấp đang chạy, giữ nguyên `.env` và các dữ liệu khác:

- `src/utils/relations.ts` (file mới)
- `src/services/taskService.ts`
- `src/services/notificationService.ts`
- `src/components/NotificationBell.tsx`

SQL bổ sung nằm ở `supabase/enhancements.sql` và `supabase/demo_access.sql`. Dừng Vite bằng Ctrl+C rồi `npm run dev`, reload browser.

## Chạy bản mới

1. Giải nén, mở terminal trong thư mục `kollab` chứa `package.json`.
2. Giữ cấu hình `.env` đang chạy của bạn. Bản ZIP giữ cấu hình Supabase publishable của project gốc; không dùng service-role key trong frontend. Nếu đổi project, sửa hai biến theo `.env.example`.
3. Sao lưu database trước khi chạy migration. Trong Supabase → SQL Editor, chạy **toàn bộ** `supabase/enhancements.sql`. File thêm notifications, trigger workflow, bucket `kollab-assets`, RPC tạo Brand và sửa sequence ID; không xóa dữ liệu nghiệp vụ. Có thể chạy lại.
4. **Chỉ với bản demo hiện tại đăng nhập qua users + localStorage:** chạy tiếp `supabase/demo_access.sql` để cho phép đọc/đánh dấu thông báo và upload ảnh bằng publishable key. Các policy demo không bảo vệ dữ liệu theo người dùng, không dùng cho bản public production. Không cần tắt RLS toàn hệ thống.
5. Chạy:

```bash
npm install
npm run dev
```

Mở địa chỉ Vite in ra, thường là `http://localhost:5173`. Nếu Supabase project đã paused, khôi phục project trên Supabase trước. Cần chạy SQL trên **đúng project** mà `.env` đang trỏ tới.

## Các thay đổi

- Brand dashboard: KPI, biểu đồ trạng thái, hiệu suất theo campaign, xếp hạng, hoạt động gần đây, draft/metrics và thanh toán cần xử lý. Các số liệu đến từ Supabase, không tạo dữ liệu giả để lấp biểu đồ.
- Brand → **Kết quả chiến dịch** hoặc nút **Kết quả** ở danh sách campaign: target vs thực tế, metrics từng creator/task, bài đăng, ngân sách/thù lao/tiền đã trả, CPV/CPE và lịch sử review. Xuất CSV.
- Bộ lọc tìm kiếm, trạng thái, campaign, creator, sản phẩm và thời gian tùy màn hình. KOL/KOC lọc nhiệm vụ/thanh toán, Admin lọc các danh sách.
- Header hiển thị avatar thật. Bấm avatar để đổi họ tên/ảnh. KOL/KOC vẫn có trang hồ sơ riêng.
- Upload avatar, ảnh sản phẩm và logo Brand: JPG/PNG/WebP, tối đa 5 MB/file. File lưu ở **Supabase Storage**, URL lưu vào bảng tương ứng. Vẫn có tùy chọn URL ảnh.
- Chuông thông báo: lưu trạng thái đã đọc vào database, bấm để mở mục liên quan; tự tải lại khoảng 20 giây khi tab đang hiển thị, hoặc bấm Làm mới. Thông báo sinh từ các sự kiện **sau khi chạy migration**, không tạo lại toàn bộ lịch sử cũ.
- Admin → Brands → **Tạo tài khoản Brand**: tạo user role BRAND và hồ sơ brands trong một giao dịch. Nếu tạo hồ sơ lỗi, tài khoản cũng được rollback.
- Trang login mới, hỗ trợ điện thoại và bật/tắt xem mật khẩu. Logo dùng SVG gọn, hiển thị đầy đủ.

## Cách đọc outcome

Metrics thường là ảnh chụp số liệu tích lũy: 24H = 10.000 views, 72H = 15.000 views. Campaign lấy **15.000**, không cộng thành 25.000. Mỗi task chỉ lấy báo cáo mới nhất theo `submitted_at`, tie-break bằng ID.

Mặc định chỉ lấy metrics APPROVED. Bỏ checkbox sẽ gồm báo cáo SUBMITTED nhưng vẫn loại REJECTED. Task CANCELLED không góp tổng hiệu suất và thù lao đang giao; tiền thực đã trả của task bị hủy vẫn được giữ trong tổng chi phí. Số tiền còn phải trả tính theo từng task đang hoạt động.

ER = (likes + comments + shares + saves) / views × 100, tính từ các snapshot đã chọn. CPV/CPE dùng **tiền đã trả**, chưa có chi phí hoặc metrics thì hiển thị chưa đủ dữ liệu. Schema chưa ghi nhận conversion thực tế nên chỉ hiển thị target conversion và ghi rõ chưa thu thập, không giả định conversion là 0.

## Luồng demo đầy đủ, tự tạo dữ liệu

Không cần thêm mock/seed mới. Dùng tài khoản Admin đang có; các email dưới đây chỉ là giá trị nhập thử, chưa được tạo sẵn.

1. **Admin:** tạo Brand `Glow Beauty`, người phụ trách `Nguyễn An`, email `brand.demo@example.com`, mật khẩu demo do bạn chọn (tối thiểu 6 ký tự). Upload logo. Kiểm tra Brand xuất hiện trong danh sách và chuông thông báo Admin.
2. **Brand mới:** đăng nhập bằng tài khoản vừa tạo. Bấm avatar góc phải, upload ảnh và lưu; reload vẫn thấy avatar.
3. **Sản phẩm:** thêm `Glow Serum`, giá 599.000, upload ảnh, lưu. Sửa mô tả/giá, thử lọc tên/trạng thái. Nếu muốn test xóa, tạo một sản phẩm phụ chưa gắn campaign rồi xóa.
4. **Chiến dịch:** tạo `Glow Serum Launch`, chọn sản phẩm, brief review skincare, target 100.000 views, ER 5%, ngân sách 10.000.000. Chọn ngày phù hợp, đổi status ACTIVE; kiểm tra sửa campaign và bộ lọc.
5. **KOL/KOC:** Brand tạo hai tài khoản mới role KOL và KOC trong mục KOL/KOC, cập nhật nền tảng TikTok/followers/category; upload avatar khi tạo. Ghi lại email/mật khẩu để đổi vai demo.
6. **Nhiệm vụ:** giao mỗi creator một task thuộc campaign, content type video, yêu cầu review, deadline và thù lao 2.000.000. Gỡ các bộ lọc trước khi kiểm tra đủ hai task.
7. **KOL:** đăng nhập → chuông báo task mới → Nhiệm vụ → Nộp draft với caption/link draft. **Brand:** Phê duyệt nội dung → từ chối với feedback. **KOL:** thấy yêu cầu sửa → nộp draft mới. **Brand:** duyệt draft mới.
8. **KOL:** sau APPROVED_TO_PUBLISH, gửi link TikTok thật hoặc link bài dùng cho demo và thời gian đăng. **Brand:** chuông báo bài đăng → Kết quả chiến dịch thấy link.
9. **KOL:** gửi metrics 24H: views 10.000, likes 600, comments 50, shares 30, saves 20. **Brand:** theo dõi hiệu suất → duyệt. Outcome hiển thị 10.000 views và ER 7%.
10. **KOC:** làm luồng draft → Brand duyệt → đăng bài → gửi metrics với views 20.000, likes 800, comments 100, shares 50, saves 50. **Brand:** duyệt. Campaign tổng views 30.000, tương tác 1.700, ER khoảng 5,67%.
11. **Brand:** vào Thanh toán, cập nhật khoản PENDING thành PAID. **KOL/KOC:** kiểm tra Thanh toán và thông báo. **Admin:** xem tổng tiền, campaign outcome và thông báo thanh toán.
12. **Outcome:** thử checkbox metrics, lọc campaign/creator, xuất CSV. Thử bộ lọc không có kết quả, xóa bộ lọc, giao diện điện thoại và dark mode.

Luồng workflow có sẵn hiện tại chỉ mở nút gửi metrics khi task PUBLISHED/TRACKING. Sau khi metrics được duyệt, task hoàn tất và UI không có nút nộp thêm snapshot. Nếu bị từ chối, task về TRACKING và có thể nộp lại. Outcome vẫn xử lý đúng nhiều snapshot đã có trong database; mở nộp nhiều kỳ sau khi task hoàn tất cần phát triển workflow riêng.

## Nếu gặp lỗi

- Không thấy bucket/RPC/notifications: kiểm tra đã chạy `enhancements.sql` thành công và đúng Supabase project. Chờ schema cache cập nhật rồi tải lại.
- Upload bị RLS chặn trong demo: chạy `demo_access.sql`; kiểm tra bucket và policy trên `storage.objects`. Không đưa service-role key vào `.env` Vite.
- RPC tạo Brand bị chặn trên `users`/`brands`: RPC là SECURITY INVOKER và tuân theo policy đang có. Cần dùng policy phù hợp mô hình auth của database; migration không mở quyền tất cả bảng nghiệp vụ.
- Email đã dùng: nhập email khác. ID 409 do seed: migration đã chỉnh sequence; giữ `supabase/fix_sequences.sql` từ project gốc để đối chiếu.

## Phạm vi kiểm thử và triển khai

TypeScript, ESLint và production build đã được chạy. Có kiểm thử logic outcome (snapshot/cancelled/zero targets/numeric strings), SQL trên Postgres riêng và browser với Supabase transport giả lập để tránh ghi vào dữ liệu thật. Đây không phải xác nhận end-to-end trên Supabase live của bạn; cần chạy migration và làm luồng demo ở trên trên project thật.

Mô hình auth gốc vẫn so khớp mật khẩu ở `users.password_hash` và giữ profile trong localStorage. Tên cột không có nghĩa mật khẩu đã được hash. Đây là **demo**, không bảo đảm phân quyền server hoặc bảo mật mật khẩu. Trước khi public production cần Supabase Auth, cấp tài khoản qua server/Edge Function, RLS theo `auth.uid()` và storage policies theo chủ sở hữu. Không dùng `demo_access.sql` cho production.

Ảnh marketing trong bucket public có URL công khai. QR ngân hàng, ảnh bằng chứng/insight vẫn dùng trường URL hiện có; không upload tài liệu thanh toán nhạy cảm vào bucket này. Nếu cần upload tài liệu riêng tư, tạo private bucket cùng auth/RLS và signed URL.

`bk`/`bk1` là bản lưu cũ được giữ nguyên; Vite chạy ứng dụng từ `src` và không dùng mock của các bản lưu đó. Bản đóng gói không chứa node_modules hoặc dist; cài lại dependencies bằng lệnh trên. Tham khảo `TIKTOK_SYNC.md` cho hướng đồng bộ TikTok.
