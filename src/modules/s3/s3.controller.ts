import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service, type MulterFile } from './s3.service';
import { DeleteS3FileDto, UploadS3FileDto } from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesEnum } from '../auth/enums/roles.enum';

@ApiTags('s3')
@ApiBearerAuth()
@Controller('s3')
@Roles(RolesEnum.ADMIN)
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file to S3 (admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string' },
        customFilename: { type: 'string' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully.',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
      },
    },
  })
  async upload(
    @UploadedFile() file: MulterFile,
    @Body() body: UploadS3FileDto,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const url = await this.s3Service.uploadFile(
      file,
      body.folder,
      body.customFilename,
    );

    return { url };
  }

  @Delete()
  @ApiOperation({ summary: 'Delete file from S3 (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
      },
    },
  })
  async delete(@Body() body: DeleteS3FileDto): Promise<{ success: boolean }> {
    await this.s3Service.deleteFile(body.key);

    return { success: true };
  }
}
