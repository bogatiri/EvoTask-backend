import { Priority } from '@prisma/client'
import { Transform, Type } from 'class-transformer'
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	ValidateNested
} from 'class-validator'

export class CardDto {
	@IsString()
	@IsOptional()
	name: string

	@IsEnum(Priority)
	@IsOptional()
	@Transform(({ value }) => ('' + value).toLowerCase())
	priority?: Priority

	@IsNumber()
	@IsOptional()
	order?: number

	@IsBoolean()
	@IsOptional()
	isCompleted?: boolean

	@IsString()
	@IsOptional()
	createdAt?: string

	@IsString()
	@IsOptional()
	description?: string
}

export class CardOrderDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CardOrderUpdateDto)
	cards: CardOrderUpdateDto[]
}

export class CardOrderUpdateDto {
	@IsUUID()
	id: string

	@IsNumber()
	order: number

	@IsUUID()
	listId: string
}
