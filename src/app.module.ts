import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { ConfigModule } from '@nestjs/config'
import { TaskModule } from './task/task.module'
import { ListModule } from './list/list.module'
import { BoardModule } from './board/board.module'
import { CardModule } from './card/card.module'
import { CommentModule } from './comment/comment.module'
import { ChatModule } from './chat/chat.module'
import { MessageModule } from './message/message.module'
import { SprintModule } from './sprint/sprint.module'
import { RolesModule } from './roles/roles.module'

@Module({
	imports: [
		ConfigModule.forRoot(),
		AuthModule,
		UserModule,
		TaskModule,
		ListModule,
		BoardModule,
		CardModule,
		CommentModule,
		ChatModule,
		MessageModule,
		SprintModule,
		RolesModule,
	]
})
export class AppModule {}
