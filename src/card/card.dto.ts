import { Priority } from '@prisma/client'
import { Transform } from 'class-transformer'
import {
	IsBoolean,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString
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
	order: number

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
