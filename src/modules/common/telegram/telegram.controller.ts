import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TelegramService } from './telegram.service';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Public()
  @Get('test')
  @ApiOperation({ summary: 'Test Telegram notification system' })
  @ApiResponse({ status: 200, description: 'Test message sent successfully' })
  async testNotification() {
    const success = await this.telegramService.testConnection();
    return {
      success,
      message: success
        ? 'Test message sent successfully to Telegram'
        : 'Failed to send test message. Check your Telegram configuration.',
    };
  }

  @Public()
  @Post('test-error')
  @ApiOperation({ summary: 'Test error notification' })
  @ApiResponse({ status: 200, description: 'Test error notification sent' })
  async testErrorNotification() {
    await this.telegramService.sendErrorNotification(
      new Error('This is a test error notification'),
      'TelegramController.testErrorNotification',
      { testData: 'Sample test data', userId: 'test-user' },
    );
    return {
      success: true,
      message: 'Test error notification sent to Telegram',
    };
  }

  @Public()
  @Post('test-warning')
  @ApiOperation({ summary: 'Test warning notification' })
  @ApiResponse({ status: 200, description: 'Test warning notification sent' })
  async testWarningNotification() {
    await this.telegramService.sendWarningNotification(
      'This is a test warning message',
      'TelegramController.testWarningNotification',
      { testData: 'Sample warning data' },
    );
    return {
      success: true,
      message: 'Test warning notification sent to Telegram',
    };
  }

  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Check Telegram service status' })
  @ApiResponse({ status: 200, description: 'Telegram service status' })
  getStatus() {
    return {
      enabled: this.telegramService['enabled'], // Access private property for status check
      message: this.telegramService['enabled']
        ? 'Telegram notifications are enabled'
        : 'Telegram notifications are disabled - missing configuration',
    };
  }
}
