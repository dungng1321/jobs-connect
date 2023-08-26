import {
  Controller,
  HttpException,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

import { FilesService } from './files.service';
import { ALLOWED_FILE_TYPES } from 'src/constants/constants.common';
import { ResponseMessage } from 'src/decorator/customize';
import { MESSAGE_SUCCESS } from 'src/constants/constants.message';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/upload')
  @ResponseMessage(MESSAGE_SUCCESS.UPLOAD_FILE_SUCCESS)
  @UseInterceptors(FileInterceptor('fileUpload'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: ALLOWED_FILE_TYPES,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 5,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const fileUrl = await this.filesService.uploadFileToS3(file);
      return { url: fileUrl };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
