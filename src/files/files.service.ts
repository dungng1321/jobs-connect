// upload.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v5 as uuidv5 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  constructor(private readonly configService: ConfigService) {}

  async uploadFileToS3(file: Express.Multer.File): Promise<string> {
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
    const region = this.configService.get('AWS_DEFAULT_REGION');
    const bucketName = this.configService.get('AWS_BUCKET_NAME');

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials are missing.');
    }
    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const key = `${uuidv5(file.originalname, uuidv5.URL)}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ACL: 'public-read',
    });

    try {
      await s3.send(command);
      return `https://${bucketName}.s3.amazonaws.com/${key}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to S3');
    }
  }
}
