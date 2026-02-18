import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as https from 'https';
import * as http from 'http';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly enabled: boolean;
  private readonly botToken: string;
  private readonly chatId: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || '';
    this.enabled = !!(this.botToken && this.chatId);
    this.baseUrl = 'https://telegrambyapss.hamed-elahifar.workers.dev';

    if (!this.enabled) {
      this.logger.warn(
        'Telegram service is disabled. Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID configuration.',
      );
    } else {
      this.logger.log('Telegram service initialized successfully');
    }
  }

  async sendMessage(message: string): Promise<boolean> {
    if (!this.enabled) {
      this.logger.warn('Telegram service is disabled. Cannot send message.');
      return false;
    }

    try {
      // Try using the proxy URL structure: /bot{token}/sendMessage
      const url = `${this.baseUrl}/bot${this.botToken}/sendMessage`;

      // Create custom agents to handle keep-alive and DNS issues
      const httpsAgent = new https.Agent({
        keepAlive: true,
        timeout: 30000,
        rejectUnauthorized: true,
        family: 4, // Force IPv4
      });

      const httpAgent = new http.Agent({
        keepAlive: true,
        timeout: 30000,
        family: 4, // Force IPv4
      });

      const response = await axios.post(
        url,
        {
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
          },
          httpsAgent,
          httpAgent,
        },
      );

      if (response.data?.ok) {
        this.logger.debug('Message sent to Telegram successfully');
        return true;
      } else {
        this.logger.error(
          `Failed to send message to Telegram: ${JSON.stringify(response.data)}`,
        );
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status,
        };
        this.logger.error(
          `Axios error sending message to Telegram: ${JSON.stringify(errorDetails)}`,
        );
      } else if (error instanceof Error) {
        this.logger.error(
          `Error sending message to Telegram: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Unknown error sending message to Telegram:', error);
      }
      return false;
    }
  }

  async sendErrorNotification(
    error: Error,
    context: string,
    additionalData?: Record<string, any>,
  ): Promise<void> {
    if (!this.enabled) return;

    const errorMessage = this.formatErrorMessage(
      error,
      context,
      additionalData,
    );
    await this.sendMessage(errorMessage);
  }

  async sendWarningNotification(
    message: string,
    context: string,
    additionalData?: Record<string, any>,
  ): Promise<void> {
    if (!this.enabled) return;

    const warningMessage = this.formatWarningMessage(
      message,
      context,
      additionalData,
    );
    await this.sendMessage(warningMessage);
  }

  async testConnection(): Promise<boolean> {
    if (!this.enabled) return false;

    const testMessage = `🧪 <b>Test Message</b>
Environment: ${this.configService.get('NODE_ENV', 'development')}
Time: ${new Date().toISOString()}
Message: Telegram integration is working correctly!`;

    return await this.sendMessage(testMessage);
  }

  private formatErrorMessage(
    error: Error,
    context: string,
    additionalData?: Record<string, any>,
  ): string {
    const env = this.configService.get<string>('NODE_ENV', 'development');
    const timestamp = new Date().toISOString();

    let message = `🚨 <b>Application Error</b>

<b>Environment:</b> ${env}
<b>Time:</b> ${timestamp}
<b>Context:</b> ${context}
<b>Error:</b> ${error.name}
<b>Message:</b> ${error.message}`;

    if (error.stack) {
      const stackLines = error.stack.split('\n').slice(0, 5);
      message += `\n\n<b>Stack Trace:</b>\n<code>${stackLines.join('\n')}</code>`;
    }

    if (additionalData && Object.keys(additionalData).length > 0) {
      message += `\n\n<b>Additional Data:</b>\n<code>${JSON.stringify(additionalData, null, 2)}</code>`;
    }

    return message;
  }

  private formatWarningMessage(
    warningMessage: string,
    context: string,
    additionalData?: Record<string, any>,
  ): string {
    const env = this.configService.get<string>('NODE_ENV', 'development');
    const timestamp = new Date().toISOString();

    let message = `⚠️ <b>Application Warning</b>

<b>Environment:</b> ${env}
<b>Time:</b> ${timestamp}
<b>Context:</b> ${context}
<b>Message:</b> ${warningMessage}`;

    if (additionalData && Object.keys(additionalData).length > 0) {
      message += `\n\n<b>Additional Data:</b>\n<code>${JSON.stringify(additionalData, null, 2)}</code>`;
    }

    return message;
  }
}
