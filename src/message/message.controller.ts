/* eslint-disable no-console */
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { MessageService } from './message.service'

@Controller('user/messages')
export class MessageController {
	constructor(private readonly messageService: MessageService) {}

	@Get()
	@Auth()
	async getAll(@CurrentUser('id') userId: string) {
		return this.messageService.getAll(userId)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post()
	@Auth()
	async create(@Body() body: any, @CurrentUser('id') userId: string) {
		const { chat, ...dto } = body
		const chatId = chat.connect.id
		return this.messageService.create(dto, userId, chatId)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put(':id')
	@Auth()
	async update(
		@Body() body: any,
		@CurrentUser('id') userId: string,
		@Param('id') id: string
	) {
		const { text} = body
		return this.messageService.update(text, id, userId)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth()
	async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
		return this.messageService.delete(id, userId)
	}
}
