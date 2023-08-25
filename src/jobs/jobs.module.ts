import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobSchema, Job } from './schemas/job.shema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }])],

  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
