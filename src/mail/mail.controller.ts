import { Body, Controller, Get, HttpException, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { Cron } from '@nestjs/schedule';
import { Public, ResponseMessage } from 'src/decorator/customize';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get()
  @Public()
  // 20h friday every week
  @Cron('0 0 20 * * 5')
  @ResponseMessage('Send email successfully')
  async handleSendEmailSubscriberJob() {
    try {
      await this.mailService.sendEmail();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
