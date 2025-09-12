import * as nodeCrypto from 'crypto';

// Check if global.crypto is undefined before assigning
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = nodeCrypto;
}
