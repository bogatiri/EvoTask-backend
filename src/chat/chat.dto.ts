import { IsOptional, IsString, IsUUID } from 'class-validator'

export class ChatDto {
	@IsString()
	name: string

	@IsUUID()
	@IsOptional()
	cardId?: string

	@IsUUID()
	@IsOptional()
	listId?: string

	@IsUUID()
	@IsOptional()
	boardId?: string
}
