import { HttpStatus } from '@nestjs/common';

export type ErrorType = {
  message: string;
  statusCode: HttpStatus;
  errorCode: string;
};

export interface IGeneralErrorShape {
  name?: string;
  message?: string;
  errorCode?: string;
  description?: string;
  statusCode?: HttpStatus;
  customData?: unknown;
  stackTrace?: string;
  logData?: unknown;
  errors?: unknown;
}

export enum ErrorCode {
  // General errors
  UNKNOWN_ERROR = '000',
  BAD_REQUEST = '400',
  UNAUTHORIZED = '401',
  FORBIDDEN = '403',
  NOT_FOUND = '404',
  TOO_MANY_REQUESTS = '429',
  INTERNAL_SERVER_ERROR = '500',
  SERVICE_UNAVAILABLE = '503',

  // Authentication & authorization errors
  JWT_INVALID = '001',
  JWT_EXPIRED = '002',

  /** Specific errors */

  INVALID_FORMAT_PHONE_NUMBER = '003',
  ROLE_NOT_FOUND = '004',
  EMAIL_ALREADY_EXISTS = '005',
  USER_NOT_FOUND = '006',
  DEFAULT_ADDRESS = '007',
  CREATE_CUSTOMER_FAILED = '008',
  INVALID_VERIFYCATION_CODE = '009',
  EXPIRED_VERIFYCATION_CODE = '010',
  USER_HAS_NOT_VERIFY_EMAIL = '011',
  USER_BANNED = '012',
  INCORRECT_USER_INFO = '013',
  SEGMENT_EXISTED = '014',
  SEGMENT_NOT_FOUND = '015',
  PRODUCT_CATEGORY_EXISTED = '016',
  PRODUCT_CATEGORY_NOT_FOUND = '017',
  PRODUCT_SUBCATEGORY_EXISTED = '018',
  PRODUCT_SUBCATEGORY_NOT_FOUND = '019',
  PRODUCT_NOT_FOUND = '020',
  PRODUCT_NOT_AVAILABLE = '021',
  AUTH_PROVIDER_NOT_FOUND = '022',
  INVALID_HASH = '023',
  PRODUCT_INACTIVE = '024',
  VARIANT_INACTIVE = '025',
  SIZE_INACTIVE = '026',
  SIZE_OUT_OF_STOCK = '027',
}
