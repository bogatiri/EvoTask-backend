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
import { CardDto, CardOrderDto } from './card.dto'
import { CardService } from './card.service'

@Controller('user/cards')
export class CardController {
	constructor(private readonly cardService: CardService) {}

	@Get(':id')
	@Auth()
	async findByListId(@Param('id') id: string) {
		return this.cardService.findByListId(id)
	}

	@Get('card/:id')
	@Auth()
	async getById(@Param('id') id: string) {
		return this.cardService.getById(id)
	}

	@Get()
	@Auth()
	async getAll(@CurrentUser('id') userId: string) {
		return this.cardService.getAll(userId)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post()
	@Auth()
	async create(@Body() body: any, @CurrentUser('id') userId: string) {
		const { list, ...dto } = body
		// const listId = list.connect.id
		return this.cardService.create(dto, userId, list)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('copy')
	@Auth()
	async copyCard(@Body() body: any) {
		const { cardId, listId} = body
		return this.cardService.copyCard( cardId, listId)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put('update-order')
	@Auth()
	async updateOrder(@Body() cardOrderDto: CardOrderDto) {
		return this.cardService.updateOrder(cardOrderDto.cards)
	}

	@HttpCode(200)
  @Put(':id/users')
  async addUserToCard(
    @Param('id') boardId: string, 
    @Body() body: any 
  ){
		const {email, cardId} = body
    return this.cardService.addUserToCard(email, boardId, cardId);
  }

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put(':id')
	@Auth()
	async update(
		@Body() dto: CardDto,
		// @CurrentUser('id') userId: string,
		@Param('id') id: string
	) {
		return this.cardService.update(dto, id)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth()
	async delete(@Param('id') id: string) {
		return this.cardService.delete(id, )
	}
}
