import {
  Post,
  Get,
  Controller,
  UseGuards,
  Req,
  HttpException,
  Body,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from 'src/decorator/customize';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { ResponseMessage } from 'src/decorator/customize';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { MESSAGE_SUCCESS } from 'src/constants/constants.message';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: any) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('/register')
  @ResponseMessage(MESSAGE_SUCCESS.REGISTER_NEW_USER_SUCCESS)
  async register(@Body() registerUserDto: RegisterUserDto) {
    try {
      return await this.authService.register(registerUserDto);
    } catch (error) {
      throw new HttpException(error.message, error.statusCode);
    }
  }

  // get profile of user after login success
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
