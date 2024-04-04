import { IsOptional, IsString } from 'class-validator'

export class BoardDto {
	@IsString()
	@IsOptional()
	name: string

	@IsString()
	@IsOptional()
	createdAt?: string

	@IsString()
	@IsOptional()
	description?: string
}
