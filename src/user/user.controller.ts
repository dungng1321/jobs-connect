import { Controller, Delete, Get } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Get()
  findAll(): string {
    return 'This action returns all users';
  }
}
