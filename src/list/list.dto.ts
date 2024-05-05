import { Type_list } from '@prisma/client'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'

export class ListDto {
	@IsString()
	@IsOptional()
	name: string

	@IsEnum(Type_list)
	@IsOptional()
	@Transform(({ value }) => typeof value === 'string' ? value.toLowerCase() : value
)
	type?: Type_list

	@IsNumber()
	@IsOptional()
	order?: number

	@IsString()
	@IsOptional()
	createdAt?: string

	@IsString()
	@IsOptional()
	description?: string
}

export class ListOrderDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ListOrderUpdateDto)
	lists: ListOrderUpdateDto[]
}

export class ListOrderUpdateDto {
	@IsUUID()
	id: string

	@IsNumber()
	order: number
}
