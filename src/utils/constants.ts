const CONTENT_TYPE_JSON = 'application/json;charset=utf-8';

const DEFAULT_HEADERS = {
  'Content-Type': CONTENT_TYPE_JSON,
};

const DEFAULT_EXPIRES_IN = 3600;

const REGEX = {
  ESCAPE_SPECIAL_CHARS: /[-[\]{}()*+?.,\\/^$|#\s]/g,
};

const REDIS_STORAGE_KEY = {};

export { DEFAULT_EXPIRES_IN, DEFAULT_HEADERS, REDIS_STORAGE_KEY, REGEX };
