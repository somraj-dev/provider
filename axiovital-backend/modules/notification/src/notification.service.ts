import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import { IEventBus, EVENT_BUS } from '@axiovital/events';
import { SendNotificationDto, SendMessageDto } from './dto/notification.dto';
import { NotificationChannel, NotificationPriority } from '@prisma/client';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  // ---- NOTIFICATIONS ----

  async sendNotification(tenantId: string, dto: SendNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        tenantId,
        recipientUserId: dto.recipientUserId,
        title: dto.title,
        message: dto.message,
        channel: dto.channel || NotificationChannel.IN_APP,
        priority: dto.priority || NotificationPriority.NORMAL,
        metadata: dto.metadata || {},
      },
    });

    // Publish event to Kafka / Event bus for WebSocket delivery
    await this.eventBus.publish({
      eventId: notification.id,
      eventType: 'notification.created',
      aggregateType: 'Notification',
      aggregateId: notification.id,
      tenantId,
      occurredAt: new Date().toISOString(),
      version: 1,
      data: {
        notificationId: notification.id,
        recipientUserId: notification.recipientUserId,
        title: notification.title,
        priority: notification.priority,
      },
    });

    this.logger.log(`Notification sent to user ${dto.recipientUserId}: "${dto.title}"`);
    return notification;
  }

  async getUserNotifications(tenantId: string, userId: string, unreadOnly = false, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const whereClause = {
      tenantId,
      recipientUserId: userId,
      ...(unreadOnly ? { isRead: false } : {}),
    };

    const [notifications, total, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: whereClause }),
      this.prisma.notification.count({ where: { tenantId, recipientUserId: userId, isRead: false } }),
    ]);

    return {
      data: notifications,
      meta: { total, unreadCount, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(tenantId: string, notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, tenantId, recipientUserId: userId },
    });

    if (!notification) throw new NotFoundException(`Notification ${notificationId} not found`);

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  // ---- CLINICAL MESSAGING ----

  async sendMessage(tenantId: string, senderUserId: string, dto: SendMessageDto) {
    const message = await this.prisma.message.create({
      data: {
        tenantId,
        senderUserId,
        recipientUserId: dto.recipientUserId,
        content: dto.content,
        patientId: dto.patientId,
      },
      include: {
        sender: { select: { firstName: true, lastName: true } },
        recipient: { select: { firstName: true, lastName: true } },
        patient: { select: { firstName: true, lastName: true, mrn: true } },
      },
    });

    // Also raise in-app notification to recipient
    await this.sendNotification(tenantId, {
      recipientUserId: dto.recipientUserId,
      title: `New message from Dr. ${message.sender.firstName} ${message.sender.lastName}`,
      message: dto.content.slice(0, 100),
      priority: NotificationPriority.NORMAL,
      metadata: { messageId: message.id, patientId: dto.patientId },
    });

    this.logger.log(`Clinical message sent from ${senderUserId} to ${dto.recipientUserId}`);
    return message;
  }

  async getConversation(tenantId: string, userAId: string, userBId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const whereClause = {
      tenantId,
      OR: [
        { senderUserId: userAId, recipientUserId: userBId },
        { senderUserId: userBId, recipientUserId: userAId },
      ],
    };

    const [messages, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { sentAt: 'desc' },
        include: {
          sender: { select: { firstName: true, lastName: true } },
          recipient: { select: { firstName: true, lastName: true } },
          patient: { select: { firstName: true, lastName: true, mrn: true } },
        },
      }),
      this.prisma.message.count({ where: whereClause }),
    ]);

    return {
      data: messages,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
