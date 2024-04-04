import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'

@Module({
	controllers: [ChatController],
	providers: [ChatService, PrismaService],
	exports: [ChatService]
})
export class ChatModule {}
