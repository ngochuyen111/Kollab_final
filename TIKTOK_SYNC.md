# Đồng bộ số liệu TikTok

## Có cách lấy views, likes, comments, shares không?

Có: TikTok Display API, endpoint `/v2/video/query/`, có các trường `view_count`, `like_count`, `comment_count`, `share_count`. Endpoint yêu cầu scope `video.list`, token của creator đã cấp quyền và kiểm tra video thuộc người đó; tối đa 20 video/request. Chỉ có URL bất kỳ không đủ để gọi API này. Danh sách field hiện công bố không gồm saves, nên không tự điền saves = 0 như dữ liệu thật.

Điều kiện: TikTok developer account, ứng dụng được duyệt Login Kit/TikTok API, scope `user.info.basic` + `video.list`, redirect URL/OAuth và creator chủ động cấp quyền. Đăng nhập Kollab hiện tại không tự tạo token TikTok.

## Miễn phí được không?

API chính thức giúp tránh thuê scraper bên thứ ba. Các tài liệu endpoint được kiểm tra không nêu cam kết miễn phí/quota thương mại cho mọi trường hợp, nên không thể hứa mọi campaign sync đều miễn phí. Cần kiểm tra quyền truy cập/quota của app đã được duyệt.

Supabase có gói Free với 1 GB file storage, 500 MB database và hạn mức lưu lượng; demo ít avatar/ảnh có thể nằm trong gói này. Đây là nhận định theo khối lượng nhỏ, không bảo đảm vận hành không tốn phí nếu vượt hạn mức hoặc dùng dịch vụ khác. Kiểm tra Usage trước khi tăng quy mô.

## Kiến trúc đề xuất, không cần backend riêng

1. Creator bấm Kết nối TikTok, OAuth với state chống giả mạo.
2. Supabase Edge Function nhận callback và đổi authorization code lấy token. Client secret nằm trong Function Secrets, không trong biến `VITE_*`.
3. Lưu token riêng, giới hạn truy cập server, liên kết `open_id` với đúng creator; hỗ trợ refresh, thu hồi kết nối và thời gian hết hạn.
4. Creator chọn video đã cấp quyền và liên kết với `published_posts`. Function kiểm tra người gọi được phép thao tác task trước khi query TikTok.
5. Function gọi `video/query` và ghi snapshot có nguồn TIKTOK, video_id, synced_at, trường nào không khả dụng phải có cờ nguồn/thiếu dữ liệu. Thiết kế bảng snapshot riêng hoặc migration rõ ràng; schema metrics hiện tại chưa chứa provenance và trạng thái thiếu saves.
6. Snapshot được gửi Brand xác minh theo workflow hiện có; outcome chỉ lấy snapshot mới nhất, không cộng các số tích lũy. Có rate limit, retry/backoff và kiểm tra video bị xóa/private/token hết hạn.

Supabase Auth là tiền đề để Function xác định danh tính an toàn; không tin user_id/role lấy từ localStorage. Không nhét token TikTok vào frontend hoặc dùng service-role key trực tiếp trong React.

**Bản source này chưa triển khai OAuth/sync TikTok live** vì chưa có app được duyệt hoặc token cấp quyền. Metrics nhập tay và Brand xác minh vẫn hoạt động. Không có nút sync giả hoặc số liệu tự tạo.

## Nguồn chính thức đã kiểm tra ngày 03/10/2026

- [TikTok Query Videos](https://developers.tiktok.com/docs/en/tiktok-api-v2-video-query)
- [TikTok Display API — Get Started](https://developers.tiktok.com/docs/en/display-api-get-started)
- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
