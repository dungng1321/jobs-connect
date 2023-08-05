import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/schemas/user.schema';
import { comparePassword } from 'src/util/hashPassword';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/interface/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const response = await this.usersService.findByUsername(username);
    const user = response.data as User;

    if (user && comparePassword(password, user.password)) {
      return user;
    }
  }

  async login(user: IUser) {
    const { _id, name, email, role } = user;
    const payload = {
      sub: 'token login system',
      _id,
      name,
      email,
      role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      _id,
      name,
      email,
      role,
    };
  }
}
