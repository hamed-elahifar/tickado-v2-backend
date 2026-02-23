import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotifService } from './notif.service';
import { Notif, NotifDocument } from './notif.model';
import { CreateNotifDto, GetMyNotifsQueryDto } from './dto';
import { GetJwt } from '../auth/decorators/jwt.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('notifications')
@Controller('notifs')
export class NotifController {
  constructor(private readonly notifService: NotifService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification has been created successfully.',
    type: Notif,
  })
  create(@Body() createNotifDto: CreateNotifDto): Promise<NotifDocument> {
    return this.notifService.create(createNotifDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get notifications for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Return notifications of the authenticated user.',
    type: [Notif],
  })
  myNotifications(
    @GetJwt() jwt: JwtPayload,
    @Query() query: GetMyNotifsQueryDto,
    @Query('projection') projection?: string | string[],
  ): Promise<NotifDocument[]> {
    return this.notifService.getMyNotifications(jwt.userID, query, projection);
  }

  @Patch('me/read-all')
  @ApiOperation({
    summary: 'Mark all authenticated user notifications as read',
  })
  @ApiResponse({
    status: 200,
    description: 'All unread notifications were marked as read.',
  })
  markAllAsRead(@GetJwt() jwt: JwtPayload): Promise<{ modifiedCount: number }> {
    return this.notifService.markAllAsRead(jwt.userID);
  }

  @Patch('me/:id/read')
  @ApiOperation({ summary: 'Mark one authenticated user notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification read status updated successfully.',
    type: Notif,
  })
  markAsRead(
    @GetJwt() jwt: JwtPayload,
    @Param('id') id: string,
  ): Promise<NotifDocument> {
    return this.notifService.markAsRead(id, jwt.userID);
  }

  @Patch('me/:id/unread')
  @ApiOperation({
    summary: 'Mark one authenticated user notification as unread',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification read status updated successfully.',
    type: Notif,
  })
  markAsUnread(
    @GetJwt() jwt: JwtPayload,
    @Param('id') id: string,
  ): Promise<NotifDocument> {
    return this.notifService.markAsUnread(id, jwt.userID);
  }

  @Get('me/unread-count')
  @ApiOperation({
    summary: 'Get unread notifications count for authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Return number of unread notifications.',
  })
  unreadCount(@GetJwt() jwt: JwtPayload): Promise<{ unreadCount: number }> {
    return this.notifService.getUnreadCount(jwt.userID);
  }
}
