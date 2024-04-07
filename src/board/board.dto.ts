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
}
