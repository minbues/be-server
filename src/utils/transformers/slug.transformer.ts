import slugify from 'slugify';

export const convertToSlug = (text: string): string => {
  return slugify(text, {
    lower: true, // Chuyển thành chữ thường
    strict: true, // Loại bỏ ký tự đặc biệt
    replacement: '_', // Dùng "_" thay vì "-"
  });
};
