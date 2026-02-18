import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher from 'pusher';
import { CustomLogger } from '../logger/logger.service';

@Injectable()
export class PusherService {
  private pusher: Pusher;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext('PusherService');

    this.pusher = new Pusher({
      appId: this.configService.getOrThrow<string>('PUSHER_APP_ID'),
      key: this.configService.getOrThrow<string>('PUSHER_KEY'),
      secret: this.configService.getOrThrow<string>('PUSHER_SECRET'),
      cluster: this.configService.getOrThrow<string>('PUSHER_CLUSTER'),
      useTLS: true,
    });
  }

  async trigger(channel: string, event: string, data: unknown) {
    try {
      await this.pusher.trigger(channel, event, data);
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Failed to trigger Pusher event', errorStack, {
        channel,
        event,
        data,
      });
      throw error;
    }
  }

  async triggerToUser(userId: string, event: string, data: unknown) {
    const channel = `private-user-${userId}`;
    await this.trigger(channel, event, data);
  }

  async triggerToGame(gameId: string, event: string, data: unknown) {
    const channel = `private-game-${gameId}`;
    await this.trigger(channel, event, data);
  }

  async triggerToChannel(channel: string, event: string, data: unknown) {
    await this.trigger(channel, event, data);
  }
}
