import { IsNumber, IsOptional, IsString } from 'class-validator'

export class TimeBlockDto {
	@IsString()
	name: string

	@IsString()
	@IsOptional()
	color?: string

	@IsNumber()
	@IsOptional()
	duration: number

	@IsNumber()
	@IsOptional()
	order: number
}
