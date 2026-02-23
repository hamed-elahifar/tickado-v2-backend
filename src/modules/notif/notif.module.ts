import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotifController } from './notif.controller';
import { Notif, NotifSchema } from './notif.model';
import { NotifRepository } from './notif.repository';
import { NotifService } from './notif.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Notif.name,
        schema: NotifSchema,
      },
    ]),
  ],
  controllers: [NotifController],
  providers: [NotifService, NotifRepository],
  exports: [NotifService, NotifRepository, MongooseModule],
})
export class NotifModule {}
