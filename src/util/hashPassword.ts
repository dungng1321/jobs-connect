import { genSaltSync, hashSync, compareSync } from 'bcryptjs';

export const hashPassword = (password: string) => {
  const salt = genSaltSync(10);
  const hashedPassword = hashSync(password, salt);
  return hashedPassword;
};

export const comparePassword = (password: string, hashedPassword: string) => {
  return compareSync(password, hashedPassword);
};
