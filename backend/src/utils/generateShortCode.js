import { customAlphabet } from 'nanoid';

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
// Generate a 6-character short code
const nanoid = customAlphabet(alphabet, 6);

export const generateShortCode = () => {
  return nanoid();
};
