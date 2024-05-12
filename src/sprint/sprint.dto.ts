import { Status } from '@prisma/client'
import { Transform } from 'class-transformer'
import { IsEnum, IsOptional, IsString } from 'class-validator'

export class SprintDto {
	@IsString()
	@IsOptional()
	name: string

	@IsString()
	@IsOptional()
	goal: string


	@IsString()
	@IsOptional()
	startDate?: string

	@IsEnum(Status)
	@IsOptional()
	@Transform(({ value }) => typeof value === 'string' ? value.toLowerCase() : value
)
	status?: Status

	@IsString()
	@IsOptional()
	endDate?: string
}
