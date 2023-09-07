import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from 'src/jobs/schemas/job.shema';
import {
  Subscriber,
  SubscriberDocument,
} from 'src/subscribers/schemas/subscriber.schema';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    @InjectModel(Subscriber.name)
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
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
}
