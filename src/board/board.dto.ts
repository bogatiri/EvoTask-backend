import { Status } from '@prisma/client'
import { Transform } from 'class-transformer'
import { IsEnum, IsOptional, IsString } from 'class-validator'

export class BoardDto {
	@IsString()
	@IsOptional()
	name: string

	@IsString()
	@IsOptional()
	createdAt?: string

	@IsString()
	@IsOptional()
  imageId?:string
	
	@IsString()
	@IsOptional()
  imageThumbUrl?:string  
	
	@IsString()
	@IsOptional()
	imageFullUrl?:string  
	
	@IsString()
	@IsOptional()
	imageUserName?:string  
	
	@IsString()
	@IsOptional()
	imageLinkHTML?:string  

	@IsString()
	@IsOptional()
	description?: string

	@IsEnum(Status)
	@IsOptional()
	@Transform(({ value }) => typeof value === 'string' ? value.toLowerCase() : value
)
	status?: Status
}
