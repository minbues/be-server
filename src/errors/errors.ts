import { HttpStatus } from '@nestjs/common';

import { ErrorCode, ErrorType } from './errors.interface';

const BASE_ERROR_CODE = '10';
const GENERAL_GROUP_ERROR_CODE = '00';
// const THIRD_PARTY_GROUP_ERROR_CODE = '01';

const getErrorCode = (code: ErrorCode, group = GENERAL_GROUP_ERROR_CODE) =>
  `${BASE_ERROR_CODE}${group}${code}`;

export const Errors: Record<string, ErrorType> = {
  INTERNAL_SERVER_ERROR: {
    errorCode: getErrorCode(ErrorCode.INTERNAL_SERVER_ERROR),
    message: 'Internal server error.',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  UNKNOWN_ERROR: {
    errorCode: getErrorCode(ErrorCode.UNKNOWN_ERROR),
    message: 'An unknown error occurred.',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  INVALID_FORMAT_PHONE_NUMBER: {
    errorCode: getErrorCode(ErrorCode.INVALID_FORMAT_PHONE_NUMBER),
    message: 'Phone number invalid format.',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  ROLE_NOT_FOUND: {
    errorCode: getErrorCode(ErrorCode.INVALID_FORMAT_PHONE_NUMBER),
    message: 'Role not found.',
    statusCode: HttpStatus.NOT_FOUND,
  },
  USER_NOT_FOUND: {
    errorCode: getErrorCode(ErrorCode.USER_NOT_FOUND),
    message: 'User not found.',
    statusCode: HttpStatus.NOT_FOUND,
  },
  EMAIL_ALREADY_EXISTS: {
    errorCode: getErrorCode(ErrorCode.EMAIL_ALREADY_EXISTS),
    message: 'Email already exists.',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  DEFAULT_ADDRESS: {
    errorCode: getErrorCode(ErrorCode.DEFAULT_ADDRESS),
    message: 'Cannot delete the default address.',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  INVALID_VERIFYCATION_CODE: {
    errorCode: getErrorCode(ErrorCode.INVALID_VERIFYCATION_CODE),
    message: 'Invalid verification code',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  EXPIRED_VERIFYCATION_CODE: {
    errorCode: getErrorCode(ErrorCode.EXPIRED_VERIFYCATION_CODE),
    message: 'Expired verification code',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  CREATE_CUSTOMER_FAILED: {
    errorCode: getErrorCode(ErrorCode.CREATE_CUSTOMER_FAILED),
    message: 'Create account failed. Please try again',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  USER_HAS_NOT_VERIFY_EMAIL: {
    errorCode: getErrorCode(ErrorCode.USER_HAS_NOT_VERIFY_EMAIL),
    message: 'User has not verified email',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  USER_BANNED: {
    errorCode: getErrorCode(ErrorCode.USER_BANNED),
    message: 'User banned',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  INCORRECT_USER_INFO: {
    errorCode: getErrorCode(ErrorCode.INCORRECT_USER_INFO),
    message: 'Incorrect user information',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  SEGMENT_EXISTED: {
    errorCode: getErrorCode(ErrorCode.SEGMENT_EXISTED),
    message: 'Segment already exists',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  SEGMENT_NOT_FOUND: {
    errorCode: getErrorCode(ErrorCode.SEGMENT_NOT_FOUND),
    message: 'Segment not found',
    statusCode: HttpStatus.NOT_FOUND,
  },
  PRODUCT_CATEGORY_EXISTED: {
    errorCode: getErrorCode(ErrorCode.PRODUCT_CATEGORY_EXISTED),
    message: 'Product category already exists',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  PRODUCT_CATEGORY_NOT_FOUND: {
    errorCode: getErrorCode(ErrorCode.PRODUCT_CATEGORY_NOT_FOUND),
    message: 'Product category not found',
    statusCode: HttpStatus.NOT_FOUND,
  },
  PRODUCT_SUBCATEGORY_EXISTED: {
    errorCode: getErrorCode(ErrorCode.PRODUCT_SUBCATEGORY_EXISTED),
    message: 'Product subcategory already exists',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  PRODUCT_SUBCATEGORY_NOT_FOUND: {
    errorCode: getErrorCode(ErrorCode.PRODUCT_SUBCATEGORY_NOT_FOUND),
    message: 'Product subcategory not found',
    statusCode: HttpStatus.NOT_FOUND,
  },
  PRODUCT_NOT_FOUND: {
    errorCode: getErrorCode(ErrorCode.PRODUCT_NOT_FOUND),
    message: 'Product not found',
    statusCode: HttpStatus.NOT_FOUND,
  },
  PRODUCT_NOT_AVAILABLE: {
    errorCode: getErrorCode(ErrorCode.PRODUCT_NOT_AVAILABLE),
    message: 'Product not available',
    statusCode: HttpStatus.NOT_FOUND,
  },
  AUTH_PROVIDER_NOT_FOUND: {
    errorCode: getErrorCode(ErrorCode.AUTH_PROVIDER_NOT_FOUND),
    message: 'Logic via provider not found',
    statusCode: HttpStatus.NOT_FOUND,
  },
  INVALID_HASH: {
    errorCode: getErrorCode(ErrorCode.INVALID_HASH),
    message: 'Invalid hash',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  PRODUCT_INACTIVE: {
    errorCode: getErrorCode(ErrorCode.PRODUCT_INACTIVE),
    message: 'This product is currently unavailable.',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  VARIANT_INACTIVE: {
    errorCode: getErrorCode(ErrorCode.VARIANT_INACTIVE),
    message: 'This variant is currently unavailable.',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  SIZE_INACTIVE: {
    errorCode: getErrorCode(ErrorCode.SIZE_INACTIVE),
    message: 'This size is currently unavailable.',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  SIZE_OUT_OF_STOCK: {
    errorCode: getErrorCode(ErrorCode.SIZE_OUT_OF_STOCK),
    message: 'This size is currently out of stock.',
    statusCode: HttpStatus.BAD_REQUEST,
  },
};
