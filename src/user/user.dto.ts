import {
	IsDate,
	IsEmail,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
	MinLength
} from 'class-validator'



export class PomodoroSettingsDto {
	@IsOptional()
	@IsNumber()
	@Min(1)
	workInterval?: number

	@IsOptional()
	@IsNumber()
	@Min(1)
	breakInterval?: number

	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(10)
	intervalsCount?: number
	
	@IsOptional()
	@IsString()
	avatar?: string

	@IsOptional()
	@IsString()
	sidebarWidth?: string
}

export class UserDto extends PomodoroSettingsDto {
	@IsEmail()
	@IsOptional()
	email?: string

	@IsString()
	@IsOptional()
	name?: string

	@IsString()
	@IsOptional()
	phone?: string

	@IsString()
	@IsOptional()
	lastName?: string

	@IsString()
	@IsOptional()
	post?: string

	@IsString()
	@IsOptional()
	organization?: string

	@IsOptional()
	@MinLength(6, {
		message: 'Password must be at least 6 characters long'
	})
	@IsString()
	password?: string

	@IsString()
	@IsOptional()
	confirmationCode?: string

	@IsDate()
	@IsOptional()
	confirmationExpires?: Date
}
