export function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD') // Tách dấu khỏi chữ cái
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu thanh
    .replace(/đ/g, 'd') // Chuyển đổi chữ đ thường
    .replace(/Đ/g, 'D') // Chuyển đổi chữ Đ hoa
    .trim();
}
