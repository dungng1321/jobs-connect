import { genSaltSync, hashSync } from 'bcryptjs';

export const hashPassword = (password: string) => {
  const salt = genSaltSync(10);
  const hashedPassword = hashSync(password, salt);
  return hashedPassword;
};
