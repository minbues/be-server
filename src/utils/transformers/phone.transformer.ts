import { parsePhoneNumberFromString, formatNumber } from 'libphonenumber-js';

export function transformPhoneNumber(phoneNumber: string): string | null {
  const parsedPhone = parsePhoneNumberFromString(phoneNumber, 'VN');

  if (!parsedPhone || !parsedPhone.isValid()) {
    return null;
  }

  return formatNumber(parsedPhone.number, 'E.164');
}
