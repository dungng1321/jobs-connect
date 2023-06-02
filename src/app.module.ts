import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://dungng1321:umagSLsVHzgdzIsD@cluster0.qoacmeo.mongodb.net/',
    ),
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
