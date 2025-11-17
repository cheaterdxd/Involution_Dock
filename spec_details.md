# **TÀI LIỆU ĐẶC TẢ KỸ THUẬT: FLOATING DOCK BAR (MINIMALIST)**

## **I. TỔNG QUAN DỰ ÁN**

| Mục | Mô tả |
| :---- | :---- |
| **Tên Dự Án** | Floating Dock Bar (Tên mã: Minimalist Pinbar) |
| **Mục Tiêu** | Tạo ra một thanh công cụ nổi (Always On Top) trên Windows để truy cập nhanh các thư mục, file, link, ứng dụng và thực thi Command Line/Script. |
| **Phong Cách** | Minimalist hiện đại (Dark Mode, Blurry Transparency, Monospace Font). |
| **Đối Tượng** | Nhân viên An toàn Thông tin, cần hiệu suất cao và kiểm soát dữ liệu. |
| **Mô Hình Dữ Liệu** | Tệp JSON cục bộ (Local JSON File System) thay vì sử dụng Database bên ngoài (như Firestore). |
| **Cơ Chế Sync** | Đồng bộ thủ công (Push/Pull) qua Git/GitHub. |

## **II. CÔNG NGHỆ (TECHNOLOGY STACK)**

| Vai trò | Công nghệ | Lý do |
| :---- | :---- | :---- |
| **Wrapper/Lõi** | **Electron** | Bắt buộc để truy cập các API Native của Windows (Window Manager, Shell Access). |
| **Giao diện (Frontend)** | **React** | Quản lý trạng thái và Component UI phức tạp (Bookmark List, Pomodoro Timer). |
| **Styling** | **Tailwind CSS** | Tốc độ phát triển UI và dễ dàng tạo phong cách Minimalist/Retro. |
| **Lưu Trữ** | **Node.js fs module** | Đọc/ghi dữ liệu cấu hình vào một tệp JSON cục bộ. |
| **Đồng bộ Git** | **Node.js simple-git (hoặc tương đương)** | Thư viện để thực hiện thao tác Git (commit, push, pull). |
| **Tự động hoá** | **Node.js child\_process** | Thực thi các lệnh Command Line/Script Windows (powershell, cmd). |
| **Giao tiếp** | **IPC (Inter-Process Communication)** | Giao tiếp an toàn giữa Main Process (Native) và Renderer Process (React). |

## **III. KIẾN TRÚC VÀ GIAO TIẾP IPC**

### **A. Cấu Trúc Tiến Trình**

1. **Main Process (main.js):** Xử lý mọi thứ liên quan đến Native OS (Window Control, File I/O, Command Execution, Git Operations).  
2. **Renderer Process (React Component):** Xử lý giao diện người dùng và logic ứng dụng (đồng hồ, Pomodoro state).  
3. **Preload Script (preload.js):** Cung cấp các hàm IPC an toàn (exposed API) cho Renderer Process.

### **B. Hợp Đồng IPC (IPC Contract)**

Preload Script **PHẢI** expose một đối tượng window.electronAPI với các hàm sau:

| Tác vụ | Hàm IPC (Renderer Call) | Mô tả |
| :---- | :---- | :---- |
| **Window Control** | electronAPI.toggleMinimize(boolean state) | Thu gọn/Phục hồi cửa sổ (state: true \= thu gọn thành Callme). |
|  | electronAPI.setAlwaysOnTop(boolean state) | Bật/Tắt chế độ Always On Top. |
|  | electronAPI.onWindowMinimize(callback) | Listener nhận trạng thái thu gọn/phục hồi từ Main. |
| **Data R/W** | electronAPI.readConfig() | Đọc toàn bộ cấu hình (Bookmark, Pomodoro setting) từ tệp JSON cục bộ. |
|  | electronAPI.writeConfig(configObject) | Ghi cấu hình hiện tại vào tệp JSON cục bộ. |
| **Automation** | electronAPI.runCommand(string command) | Thực thi lệnh Shell/Command Line. Cần xử lý lỗi và trả về trạng thái. |
| **GitHub Sync** | electronAPI.gitPush() | Thực hiện Git Commit và Push file cấu hình lên repo đã định nghĩa. |
|  | electronAPI.gitPull() | Thực hiện Git Pull file cấu hình từ repo. Cần xử lý xung đột đơn giản hoặc thay thế. |

## **IV. ĐẶC TẢ CHI TIẾT THEO MODULE**

### **Module 1: Cấu hình & Window Manager (Đã hoàn thành khung)**

* **Yêu cầu Native:**  
  * Khởi tạo BrowserWindow với frame: false, transparent: true, alwaysOnTop: true, resizable: false.  
  * Kích thước ban đầu: Thanh Dock (800x50), Vị trí: Giữa màn hình ngang (translateX(-50%)).  
  * Triển khai IPC toggleMinimize: Đổi kích thước cửa sổ thành 50x50 khi thu gọn (Callme button).  
  * Sử dụng CSS \-webkit-app-region: drag trên Dock Bar chính và \-webkit-app-region: no-drag trên các nút tương tác.  
* **Yêu cầu UI:**  
  * Tạo Component **Nút Callme** (50x50) hiển thị khi thu gọn.

### **Module 2: Lưu trữ Dữ liệu Cục bộ (Data Persistence)**

* **Tệp Cấu Hình:** Dữ liệu phải được lưu trong một tệp JSON duy nhất, ví dụ: config.json, đặt trong thư mục dữ liệu ứng dụng của người dùng (app.getPath('userData') trong Electron).  
* **Cấu Trúc Dữ Liệu:**  
  {  
    "bookmarks": \[  
      {"id": "uuid-1", "name": "Docs", "type": "Folder", "target": "C:\\\\...", "icon": "Folder"},  
      {"id": "uuid-2", "name": "Shell", "type": "Command", "target": "powershell \-NoExit", "icon": "Terminal"}  
    \],  
    "pomodoro": {  
      "workDuration": 25,  
      "breakDuration": 5,  
      "longBreakDuration": 15  
    },  
    "appSettings": {  
      "transparencyLevel": 80 // 0-100  
    }  
  }

* **Logic IPC:** Triển khai ipcMain.handle cho readConfig() và writeConfig(configObject) sử dụng Node.js fs.readFile() và fs.writeFile() an toàn (async).

### **Module 3: Giao diện Cốt lõi (Minimalist UI)**

* **Font/Màu sắc:** Font Monospace (Retro-Minimalist). Dark Mode, sử dụng màu nhấn Indigo cho trạng thái hoạt động/text quan trọng.  
* **Hiệu ứng:** Sử dụng backdrop-blur-sm trên container chính để tạo hiệu ứng trong suốt mờ ảo (Blurry Transparency).  
* **Đồng hồ:** Hiển thị thời gian (HH:MM:SS) và ngày tháng (DD/MM/YYYY) rõ ràng.  
* **Bookmarks:** Hiển thị các Bookmark (sử dụng icon Lucide-react) với tên ngắn gọn.

### **Module 4: Chức năng & Tự động hoá (Command Execution)**

* **CRUD Bookmark:** Cần một giao diện Modal (không dùng window.alert hoặc window.confirm) để người dùng tạo/chỉnh sửa Bookmark, bao gồm các trường: name, type (Folder/Link/Command/App), target (Đường dẫn/Lệnh).  
* **Thực thi Command:**  
  * Main Process phải triển khai ipcMain.handle('runCommand') sử dụng **child\_process.exec()** hoặc **child\_process.spawn()** để chạy lệnh (target) từ bookmark.  
  * Đối với loại Folder hoặc Link, sử dụng electron.shell.openPath() hoặc electron.shell.openExternal().  
  * Phải xử lý lỗi nếu lệnh thực thi thất bại (ví dụ: đường dẫn không tồn tại).

### **Module 5: Pomodoro & Đồng bộ GitHub**

* **Pomodoro Timer:**  
  * Frontend (React) quản lý trạng thái đếm ngược.  
  * Phải có nút **Bắt đầu/Tạm dừng/Reset**.  
  * Khi Pomodoro kết thúc, cần có thông báo đơn giản (ví dụ: đổi màu Dock Bar hoặc thông báo OS Notification \- nếu khả thi trong Electron).  
* **Đồng bộ GitHub:**  
  * Cần một Modal Cài đặt để người dùng nhập **GitHub Personal Access Token** và **Repository URL** (cần lưu trữ an toàn trong Local JSON).  
  * Main Process triển khai ipcMain.handle('gitPush') và ipcMain.handle('gitPull') sử dụng simple-git.  
  * **Logic Push:** Đọc config.json, thêm/staging, commit với message tự động (ví dụ: "Sync by Pinbar \[timestamp\]"), và push.  
  * **Logic Pull:** Thực hiện Pull. Nếu có xung đột, ưu tiên dữ liệu từ Repository (lý tưởng là thay thế file cục bộ bằng file từ repo).

## **V. CÁC LƯU Ý BẢO MẬT/THỰC THI**

* **Security:** Luôn sử dụng contextIsolation: true và chỉ expose các hàm cần thiết thông qua Preload Script. **Không** bật nodeIntegration: true.  
* **Error Handling:** Mọi lệnh gọi IPC (đặc biệt là Command Line và Git) phải có cơ chế try...catch và gửi kết quả/thông báo lỗi về Renderer Process để hiển thị cho người dùng.

Tài liệu này đã sẵn sàng để gửi cho các Agent Code của bạn. Chúc họ code thành công\!