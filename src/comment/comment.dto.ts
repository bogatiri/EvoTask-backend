import { IsOptional, IsString, IsUUID } from 'class-validator'

export class CommentDto {
	@IsString()
	text: string

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
