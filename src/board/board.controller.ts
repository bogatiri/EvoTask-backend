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
import { BoardDto } from './board.dto'
import { BoardService } from './board.service'

@Controller('user/boards')
export class BoardController {
	constructor(private readonly boardService: BoardService) {}


	@Get(':id')
	@Auth()
	async findById(
		@Param('id') id: string
	) {
		return this.boardService.findById( id )
	}

	@Get()
	@Auth()
	async getAll(@CurrentUser('id') userId: string) {
		return this.boardService.getAll(userId)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post()
	@Auth()
	async create(@Body() dto: BoardDto, @CurrentUser('id') userId: string) {
		return this.boardService.create(dto, userId)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put(':id')
	@Auth()
	async update(
		@Body() dto: BoardDto,
		@CurrentUser('id') userId: string,
		@Param('id') id: string
	) {
		return this.boardService.update(dto, id, userId)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth()
	async delete(@Param('id') id: string) {
		return this.boardService.delete(id)
	}
}
