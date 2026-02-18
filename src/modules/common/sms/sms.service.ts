import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

interface SmsPayload {
  sending_type: string;
  from_number: string;
  code: string;
  recipients: string[];
  params: {
    code: string;
  };
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly fromNumber: string;
  private readonly patternCode: string;
  private readonly patternCodeFa: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.getOrThrow<string>('SMS_API_URL');
    this.apiKey = this.configService.getOrThrow<string>('SMS_API_KEY');
    this.fromNumber = this.configService.getOrThrow<string>('SMS_SENDER');
    this.patternCode = this.configService.getOrThrow<string>('SMS_TEMPLATE');
    this.patternCodeFa = this.configService.get<string>(
      'SMS_TEMPLATE_FA',
      this.patternCode,
    );
  }

  async sendVerify(
    receptor: string,
    token: string,
    locale: string = 'en',
  ): Promise<void> {
    await this.sendSms(receptor, token, locale);
  }

  async sendSms(
    recipient: string,
    code: string,
    locale: string = 'en',
  ): Promise<void> {
    try {
      const template = locale === 'fa' ? this.patternCodeFa : this.patternCode;

      const payload: SmsPayload = {
        sending_type: 'pattern',
        from_number: `+${this.fromNumber}`,
        code: template,
        recipients: [recipient.startsWith('+') ? recipient : `+${recipient}`],
        params: {
          code,
        },
      };

      const result = await axios.post(this.apiUrl, payload, {
        headers: {
          Authorization: this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(
        `SMS sent successfully: ${JSON.stringify(result.data, null, 2)}`,
      );
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        this.logger.error(
          'Failed to send SMS',
          err.response?.data || err.message,
        );
        const errorMessage =
          (err.response?.data as { message?: string })?.message || err.message;
        throw new Error(`SMS sending failed: ${errorMessage}`);
      }
      throw err;
    }
  }
}
