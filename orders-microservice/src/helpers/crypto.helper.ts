import { createHmac } from 'crypto';

export const encryptParams = (secret: string, queryString: string) => {
  return createHmac('sha256', secret).update(queryString).digest('hex');
};
