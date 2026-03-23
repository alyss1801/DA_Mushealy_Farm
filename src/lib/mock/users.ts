import type { User, SystemLog } from "@/types";

export const users: User[] = [
  {
    id: "u1",
    name: "Nguyễn Văn An",
    email: "an.nguyen@nongtech.vn",
    role: "ADMIN",
    phone: "0901234567",
    assignedGardens: ["g1", "g2", "g3"],
    assignedFarmIds: ["f1", "f2"],
    managedFarmerIds: ["u2", "u3", "u4"],
    status: "active",
    createdAt: "2025-10-01T08:00:00.000Z",
  },
  {
    id: "u2",
    name: "Trần Thị Bích",
    email: "bich.tran@nongtech.vn",
    role: "FARMER",
    phone: "0912345678",
    assignedGardens: ["g1", "g2"],
    assignedFarmIds: ["f1"],
    status: "active",
    createdAt: "2025-10-15T08:00:00.000Z",
  },
  {
    id: "u3",
    name: "Lê Minh Cường",
    email: "cuong.le@nongtech.vn",
    role: "FARMER",
    phone: "0923456789",
    assignedGardens: ["g3"],
    assignedFarmIds: ["f2"],
    status: "active",
    createdAt: "2025-11-01T08:00:00.000Z",
  },
  {
    id: "u4",
    name: "Phạm Thị Dung",
    email: "dung.pham@nongtech.vn",
    role: "FARMER",
    phone: "0934567890",
    assignedGardens: ["g2"],
    assignedFarmIds: ["f1"],
    status: "inactive",
    createdAt: "2025-12-01T08:00:00.000Z",
  },
];

export const currentUser: User = users[0];

export const systemLogs: SystemLog[] = [
  { id: "l1", actionType: "DEVICE_TOGGLE", description: "Bật máy bơm Vườn 1", userId: "u2", userName: "Trần Thị Bích", gardenId: "g1", gardenName: "Vườn Cải Xanh", deviceId: "d1", timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: "l2", actionType: "ALERT_ACTION", description: "Xác nhận xử lý cảnh báo độ ẩm đất", userId: "u1", userName: "Nguyễn Văn An", gardenId: "g2", gardenName: "Vườn Cà Chua", timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
  { id: "l3", actionType: "CONFIG_CHANGE", description: "Thay đổi ngưỡng cảnh báo nhiệt độ", userId: "u1", userName: "Nguyễn Văn An", gardenId: "g2", gardenName: "Vườn Cà Chua", oldValue: "35°C", newValue: "30°C", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: "l4", actionType: "SCHEDULE_CREATE", description: "Tạo lịch tưới tự động Vườn 3", userId: "u3", userName: "Lê Minh Cường", gardenId: "g3", gardenName: "Vườn Nha Đam", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: "l5", actionType: "USER_LOGIN", description: "Đăng nhập hệ thống", userId: "u2", userName: "Trần Thị Bích", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
  { id: "l6", actionType: "DEVICE_TOGGLE", description: "Tắt đèn LED Vườn 2", userId: "u2", userName: "Trần Thị Bích", gardenId: "g2", gardenName: "Vườn Cà Chua", deviceId: "d6", timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  { id: "l7", actionType: "USER_LOGIN", description: "Đăng nhập hệ thống", userId: "u1", userName: "Nguyễn Văn An", timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
  { id: "l8", actionType: "ALERT_ACTION", description: "Đóng cảnh báo độ ẩm không khí", userId: "u1", userName: "Nguyễn Văn An", gardenId: "g1", gardenName: "Vườn Cải Xanh", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
];
