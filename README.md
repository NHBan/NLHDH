"# NLHDH" 
# 🖥️ CPU Scheduling Simulator (NLHDH)

Ứng dụng web mô phỏng các thuật toán lập lịch CPU trong môn Nguyên lý Hệ điều hành, xây dựng bằng **HTML + CSS + JavaScript + Bootstrap 5**. Mỗi thuật toán nằm trong **một file riêng**, các thành viên chỉ cần vào đúng file thuật toán của mình để hoàn thiện.


---

## 1. Mục tiêu

- Chạy được trên trình duyệt, **không cần backend**.
- Nhập danh sách tiến trình (PID, thời điểm đến, thời gian xử lý), chọn thuật toán và xem kết quả.
- Hiển thị bảng kết quả (thời gian chờ, thời gian hoàn thành...) và biểu đồ Gantt.
- Code tách file rõ ràng: giao diện, style, logic điều phối và từng thuật toán.

## 2. Công nghệ sử dụng

| Công nghệ | Vai trò |
|-----------|---------|
| HTML5 | Cấu trúc trang |
| CSS3 | Style bổ sung ngoài Bootstrap |
| JavaScript (ES6+) | Xử lý logic, thuật toán |
| Bootstrap 5.3 (CDN) | Layout, form, button, card, table |

## 3. Cấu trúc thư mục

```
NLHDH/
├── index.html                # Trang chính (chỉ chứa giao diện)
├── README.md
└── assets/
    ├── algorithms/
    │   ├── index.js          # Đăng ký tất cả thuật toán
    │   ├── fcfs.js           # First Come First Served
    │   └── rr.js             # Round Robin
    ├── css/
    │   └── style.css         # CSS tùy chỉnh
    └── js/
        └── main.js           # Đọc input, gọi thuật toán, hiển thị kết quả
```

**Quy tắc:**

- Mỗi người **chỉ chỉnh sửa file thuật toán của mình** trong `assets/algorithms/`.
- Muốn sửa file chung (`index.html`, `main.js`, `style.css`, `algorithms/index.js`) phải báo nhóm trưởng.
- Thêm thuật toán mới: tạo file mới trong `assets/algorithms/` rồi đăng ký ở `index.js`.

## 4. Quy ước viết thuật toán

Mỗi file thuật toán **export một object** theo đúng định dạng sau để `main.js` gọi được:

```js
// assets/algorithms/fcfs.js
export default {
  id: "fcfs",                          // duy nhất, không dấu, không khoảng trắng
  name: "FCFS",                        // tên hiển thị trên giao diện
  description: "Tiến trình đến trước được cấp CPU trước.",
  needQuantum: false,                  // true nếu thuật toán cần time quantum (VD: RR)

  /**
   * @param {Array<{pid: string, arrival: number, burst: number}>} processes
   * @param {{quantum?: number}} options
   * @returns {{
   *   gantt: Array<{pid: string, start: number, end: number}>,
   *   table: Array<{pid: string, arrival: number, burst: number,
   *                 start: number, finish: number,
   *                 waiting: number, turnaround: number}>,
   *   avgWaiting: number,
   *   avgTurnaround: number
   * }}
   */
  run(processes, options = {}) {
    // TODO: viết thuật toán tại đây
    return { gantt: [], table: [], avgWaiting: 0, avgTurnaround: 0 };
  },
};
```

**Yêu cầu bắt buộc:**

1. Hàm `run()` phải **kiểm tra dữ liệu đầu vào** và `throw new Error("Thông báo lỗi")` khi sai (burst ≤ 0, arrival < 0, quantum không hợp lệ...).
2. Không thao tác trực tiếp DOM trong file thuật toán, việc hiển thị do `main.js` làm.
3. Không sửa mảng `processes` gốc (dùng bản sao).
4. Đặt tên biến/hàm rõ nghĩa, có comment cho các bước chính.
5. Khi CPU rảnh (chưa có tiến trình nào đến), thêm đoạn `idle` vào `gantt` hoặc bỏ qua khoảng trống, thống nhất theo `main.js`.

**Công thức dùng chung:**

- Turnaround = Finish − Arrival
- Waiting = Turnaround − Burst

## 5. Đăng ký thuật toán

Sau khi hoàn thành, thêm vào `assets/algorithms/index.js`:

```js
import fcfs from "./fcfs.js";
import rr from "./rr.js";

export const algorithms = [fcfs, rr];
```

## 6. Cách chạy chương trình

Vì dùng ES Modules (`import/export`), cần chạy qua server cục bộ thay vì mở file trực tiếp:

 cài extension **Live Server** → chuột phải `index.html` → *Open with Live Server*.



## 7. Quy trình làm việc với Git

```bash
# 1. Clone dự án
git clone <link-repo>
cd NLHDH



# 2. Code, commit thường xuyên
git add assets/algorithms/rr.js
git commit -m "feat(rr): hoàn thiện Round Robin"

# 3. Đẩy nhánh và tạo Pull Request vào main
git push origin feature/rr
```

**Quy ước commit:** `feat:` tính năng mới · `fix:` sửa lỗi · `docs:` tài liệu · `style:` giao diện

