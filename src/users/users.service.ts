import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { hashPassword } from 'src/util/hashPassword';
import {
  MESSAGE_ERROR,
  MESSAGE_SUCCESS,
} from 'src/constants/constants.message';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // create new user width async await
  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;

    const existingUser = await this.userModel.findOne({ email: rest.email });
    if (existingUser) {
      throw new BadRequestException(MESSAGE_ERROR.EMAIL_EXIST);
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await this.userModel.create({
      ...rest,
      password: hashedPassword,
    });

    const data = newUser.toObject();

    return {
      statusCode: 200,
      message: MESSAGE_SUCCESS.CREATE_NEW_USER_SUCCESS,
      data,
    };
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
