import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  Query,
} from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { RequestUser, ResponseMessage } from 'src/decorator/customize';
import { IUser } from 'src/users/interface/user.interface';
import { MESSAGE_SUCCESS } from 'src/constants/constants.message';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  //create new subscriber
  @Post('/create-new-subscriber')
  @ResponseMessage(MESSAGE_SUCCESS.CREATE_NEW_SUBSCRIBER_SUCCESS)
  create(
    @Body() createSubscriberDto: CreateSubscriberDto,
    @RequestUser() user: IUser,
  ) {
    try {
      return this.subscribersService.create(createSubscriberDto, user);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  //get all subscribers
  @Get('/get-all-subscribers')
  @ResponseMessage(MESSAGE_SUCCESS.GET_SUBSCRIBERS_SUCCESS)
  findAll(
    @Query('current') currentPage: number,
    @Query('pageSize') limit: number,
    @Query() queryString: string,
  ) {
    try {
      return this.subscribersService.findAll(currentPage, limit, queryString);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  //get subscriber by id
  @Get('/get-subscriber/:id')
  @ResponseMessage(MESSAGE_SUCCESS.GET_SUBSCRIBER_SUCCESS)
  findOne(@Param('id') id: string) {
    try {
      return this.subscribersService.findOne(id);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  //update subscriber by id
  @Patch()
  @ResponseMessage(MESSAGE_SUCCESS.UPDATE_SUBSCRIBER_SUCCESS)
  update(
    @Body() updateSubscriberDto: UpdateSubscriberDto,
    @RequestUser() user: IUser,
  ) {
    try {
      return this.subscribersService.update(updateSubscriberDto, user);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  //delete subscriber by id
  @Delete(':id')
  @ResponseMessage(MESSAGE_SUCCESS.DELETE_SUBSCRIBER_SUCCESS)
  remove(@Param('id') id: string, @RequestUser() user: IUser) {
    try {
      return this.subscribersService.remove(id, user);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
