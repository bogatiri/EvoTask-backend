import { Priority, Prisma } from '@prisma/client'
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
	completed?: boolean

	@IsString()
	@IsOptional()
	createdAt?: string

	@IsString()
	@IsOptional()
	description?: string

	@IsString()
	@IsOptional()
	points?: string
}


export class CardUpdate extends CardDto{
	users: Prisma.UserUpdateManyWithoutCardsNestedInput
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
