import { Type_list } from '@prisma/client'
import { Transform } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

export class ListDto {
	@IsString()
	@IsOptional()
	name: string

	@IsEnum(Type_list)
	@IsOptional()
	@Transform(({ value }) => ('' + value).toLowerCase())
	type?: Type_list

	@IsNumber()
	@IsOptional()
	order: number

	@IsString()
	@IsOptional()
	createdAt?: string

	@IsString()
	@IsOptional()
	description?: string
}
