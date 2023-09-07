import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Subscriber,
  SubscriberSchema,
} from 'src/subscribers/schemas/subscriber.schema';
import { Job, JobSchema } from 'src/jobs/schemas/job.shema';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          secure: true,
          auth: {
            user: configService.get('MAIL_AUTH_USER'),
            pass: configService.get('MAIL_AUTH_PASSWORD'),
          },
        },
        defaults: {
          from: `"Support Team"  <${configService.get('MAIL_AUTH_USER')}`,
        },
        preview: configService.get('MAIL_PREVIEW') === 'true' ? true : false,
        template: {
          dir: __dirname + '/templates',
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Subscriber.name, schema: SubscriberSchema },
      { name: Job.name, schema: JobSchema },
    ]),
  ],

  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
