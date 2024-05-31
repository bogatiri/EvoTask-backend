import { Name_Roles } from '@prisma/client'
import { Transform,  } from 'class-transformer'
import  {IsEnum,  IsOptional, IsString  } from 'class-validator'

export class RolesDto {
	@IsEnum(Name_Roles)
	@IsOptional()
	@Transform(({ value }) => typeof value === 'string' ? value.toLowerCase() : value
)
	name?: Name_Roles


	@IsString()
	@IsOptional()
	createdAt?: string


	@IsString()
	@IsOptional()
	sprintId?: string
}
