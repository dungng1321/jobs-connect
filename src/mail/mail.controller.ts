import { Controller, Get, HttpException } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get()
  @Public()
  @ResponseMessage('Send email successfully')
  async handleTestEmail() {
    try {
      await this.mailService.sendEmail();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
