import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from 'src/jobs/schemas/job.shema';
import {
  Subscriber,
  SubscriberDocument,
} from 'src/subscribers/schemas/subscriber.schema';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Subscriber.name)
    private readonly subscriberModel: Model<SubscriberDocument>,
    private configService: ConfigService,
  ) {}
  async sendEmail() {
    const subscribers = await this.subscriberModel.find({});
    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills = await this.jobModel.find({
        skills: { $in: subsSkills },
      });

      if (jobWithMatchingSkills.length > 0) {
        const jobs = jobWithMatchingSkills.map((item) => {
          return {
            name: item.name,
            company: item.company.name,
            salary:
              `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ',
            skills: item.skills,
          };
        });

        await this.mailerService.sendMail({
          to: subs.email,
          subject: 'New jobs for you',
          template: 'new-job',
          context: {
            receiver: subs.name,
            jobs: jobs,
          },
        });
      }
    }
  }

  // send emai forgot password with token
  async sendEmailForgotPassword(email: string) {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('Email not found');
    }

    const token = this.jwtService.sign(
      { email: user.email },
      {
        secret: this.configService.get('JWT_SECRET_FORGOT_PASSWORD'),
        expiresIn: this.configService.get(
          'JWT_EXPIRATION_TIME_FORGOT_PASSWORD',
        ),
      },
    );

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Forgot password',
      template: 'forgot-password',
      context: {
        receiver: user.name,
        token: token,
        base_url: this.configService.get('BASE_URL'),
      },
    });
  }
}
