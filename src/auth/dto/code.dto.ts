import { IsEmail, IsString } from 'class-validator'

export class CheckCodeDto {
	@IsEmail()
	email: string
	
	@IsString()
	code: string

}
