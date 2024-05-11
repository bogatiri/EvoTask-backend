import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { getJwtConfig } from 'src/config/jwt.config'
import { AuthModule } from 'src/auth/auth.module'
import { MessageModule } from 'src/message/message.module'

@Module({
	imports: [
		AuthModule,
		MessageModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig
		})
	],
	controllers: [ChatController],
	providers: [ ChatGateway, PrismaService, ChatService,  ],
	exports: [ ChatGateway, ChatService]
})
export class ChatModule {}
