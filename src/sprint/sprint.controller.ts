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
import { SprintDto } from './sprint.dto'
import { SprintService } from './sprint.service'

@Controller('user/sprints')
export class SprintController {
	constructor(private readonly sprintService: SprintService) {}

	@Get(':id')
	@Auth()
	async getAll(@Param('id') id: string) {
		return this.sprintService.getAll(id)
	}

	@Get('sprint/:id')
	@Auth()
	async getById(@Param('id') id: string) {
		return this.sprintService.getById(id)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post()
	@Auth()
	async create(@Body() dto: any, @CurrentUser('id') userId: string) {
		const {boardId, ...data} = dto
		return this.sprintService.create(data, userId, boardId)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put(':id')
	@Auth()
	async update(
		@Body() dto: SprintDto,
		@CurrentUser('id') userId: string,
		@Param('id') id: string
	) {
		return this.sprintService.update(dto, id, userId)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth()
	async delete(@Param('id') id: string) {
		return this.sprintService.delete(id)
	}
}
