import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { ConfigModule } from '@nestjs/config'
import { TaskModule } from './task/task.module'
import { TimeBlockModule } from './time-block/time-block.module'
import { PomodoroModule } from './pomodoro/pomodoro.module'
import { ListModule } from './list/list.module'
import { BoardModule } from './board/board.module'
import { CardModule } from './card/card.module'
import { CommentModule } from './comment/comment.module'
import { ChatModule } from './chat/chat.module'
import { MessageModule } from './message/message.module'

@Module({
	imports: [
		ConfigModule.forRoot(),
		AuthModule,
		UserModule,
		TaskModule,
		TimeBlockModule,
		PomodoroModule,
		ListModule,
		BoardModule,
		CardModule,
		CommentModule,
		ChatModule,
		MessageModule,
	]
})
export class AppModule {}
