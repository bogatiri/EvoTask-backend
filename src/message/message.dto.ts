import { IsOptional, IsString } from 'class-validator'

export class MessageDto {
	@IsString()
	@IsOptional()
	text: string

	@IsString()
	@IsOptional()
	createdAt?: string
}
