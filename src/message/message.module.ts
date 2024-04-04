import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { MessageController } from './message.controller'
import { MessageService } from './message.service'

@Module({
	controllers: [MessageController],
	providers: [MessageService, PrismaService],
	exports: [MessageService]
})
export class MessageModule {}
