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
import { ListDto } from './list.dto'
import { ListService } from './list.service'

@Controller('user/lists')
export class ListController {
	constructor(private readonly listService: ListService) {}

	@Get()
	@Auth()
	async getAll(@CurrentUser('id') userId: string) {
		return this.listService.getAll(userId)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post()
	@Auth()
	async create(@Body() body: any, @CurrentUser('id') userId: string) {
		const { board, ...dto } = body
		const boardId = board.connect.id

		return this.listService.create(dto, boardId, userId)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put(':id')
	@Auth()
	async update(
		@Body() dto: ListDto,
		@CurrentUser('id') userId: string,
		@Param('id') id: string
	) {
		return this.listService.update(dto, id, userId)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth()
	async delete(@Param('id') id: string) {
		return this.listService.delete(id)
	}
}
