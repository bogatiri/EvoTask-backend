/* eslint-disable no-console */
import {
	Body,
	Controller,
	// Delete,
	Get,
	// Get,
	HttpCode,
	Param,
	Post,
	// Put,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { ChatDto } from './chat.dto'
import { ChatService } from './chat.service'

@Controller('user/chats')
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	@Post('get-or-create')
	@Auth()
	async getorCreateChat(
		@CurrentUser('id') userId: string,
		@Body() body: any,
	) {
		const {boardId} = body
		return this.chatService.getorCreateChat(userId, boardId)
	}

	@Get(':id')
	@Auth()
	async findById(
		@Param('id') id: string
	) {
		return this.chatService.findById( id )
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post()
	@Auth()
	async create(@Body() dto: ChatDto, @CurrentUser('id') userId: string) {
		return this.chatService.create(dto, userId)
	}

	// @UsePipes(new ValidationPipe())
	// @HttpCode(200)
	// @Put(':id')
	// @Auth()
	// async update(
	// 	@Body() dto: ChatDto,
	// 	@CurrentUser('id') userId: string,
	// 	@Param('id') id: string
	// ) {
	// 	return this.chatService.update(dto, id, userId)
	// }

	// @HttpCode(200)
	// @Delete(':id')
	// @Auth()
	// async delete(@Param('id') id: string) {
	// 	return this.chatService.delete(id)
	// }
}
