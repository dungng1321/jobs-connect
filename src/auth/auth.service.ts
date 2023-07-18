import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/schemas/user.schema';
import { comparePassword } from 'src/util/hashPassword';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(username: string, password: string): Promise<any> {
    const response = await this.usersService.findByUsername(username);
    const user = response.data as User;

    if (user && comparePassword(password, user.password)) {
      return user;
    }
  }
}
