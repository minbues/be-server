import dayjs from 'dayjs';
import { config } from '../../config/app.config';
import { VerifyCodeEnum } from '../enum';
import { REGEX } from '../constants';

const { nodeEnv = '' } = config;

export const isProdEnv = (env = nodeEnv) => 'production' === env;

export const isDeployEnv = (env = nodeEnv) => {
  const deployEnvironments = ['development', 'staging', 'production'];
  return deployEnvironments.includes(env);
};

export const replaceQuerySearch = (search: string) => {
  return search.replace(REGEX.ESCAPE_SPECIAL_CHARS, '\\$&');
};

export const generateVerifyAccountInfo = (type: VerifyCodeEnum) => {
  const verifyAccount = {
    valid: true,
    code: Math.floor(100000 + Math.random() * 900000).toString(),
    codeExpires: dayjs().add(15, 'minutes').toDate(),
    type: type,
  };

  return verifyAccount;
};

export function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/); // tách theo khoảng trắng
  const lastName = parts[0]; // Họ
  const firstName = parts.slice(1).join(' '); // Tên + tên đệm

  return { firstName, lastName };
}

export function joinFullName(lastName: string, firstName: string): string {
  return `${lastName} ${firstName}`.trim();
}

export function generateOrderCode(
  userId: number,
  createdAt: Date,
  code: string,
): string {
  const timestamp = createdAt
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14);

  return `FS${timestamp}${userId.toString()}${code}`;
}

export function generateRandomCode(length: number = 6): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

export function decodeOrderCode(orderCode: string) {
  // Kiểm tra mã có đúng định dạng hay không (bắt đầu với 'FS')
  if (!orderCode.startsWith('FS')) {
    throw new Error('Invalid order code format');
  }

  // Lấy timestamp từ chuỗi (14 ký tự sau 'FS')
  const timestamp = orderCode.slice(2, 16);

  // Lấy phần còn lại, tách userId và code
  const remainingCode = orderCode.slice(16);

  // Phần còn lại là userId + code. Giả sử code luôn có 6 ký tự.
  const userIdLength = remainingCode.length - 6; // Phần còn lại là userId + code (6 ký tự code)
  const userId = parseInt(remainingCode.slice(0, userIdLength), 10);
  const code = remainingCode.slice(userIdLength);

  return {
    createdAt: parseTimestampISO(timestamp).toISOString(), // Thời gian tạo đơn hàng (yyyyMMddHHmmss)
    userId, // userId đã mã hóa
    code, // Mã ngẫu nhiên đã được thêm vào
  };
}

export function parseTimestampISO(ts: string): Date {
  if (!/^\d{14}$/.test(ts)) {
    throw new Error(`Invalid timestamp format: ${ts}`);
  }
  // Turn "YYYYMMDDhhmmss" → "YYYY-MM-DDThh:mm:ssZ"
  const iso = ts.replace(
    /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/,
    '$1-$2-$3T$4:$5:$6Z',
  );

  return new Date(iso);
}
