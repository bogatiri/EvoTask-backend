/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UploadedFile,
	UseInterceptors,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import * as multer from 'multer'
const path = require('path');

import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { v4 as uuidv4 } from 'uuid'
import { UserDto } from './user.dto'
import { UserService } from './user.service'
@Controller('user/profile')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get(':id')
	@Auth()
	async findById(
		@Param('id') id: string
	) {
		return this.userService.findById( id )
	}

	@Get()
	@Auth()
	async profile(@CurrentUser('id') id: string) {
		return this.userService.getProfile(id)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put()
	@Auth()
	async updateProfile(@CurrentUser('id') id: string, @Body() dto: UserDto) {
		return this.userService.update(id, dto)
	}

	@Post(':userId/avatar')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: multer.diskStorage({
				destination: './uploads/temp', // временное хранилище файлов
				filename: (req, file, cb) => {
					// Получение расширения файла
					const fileExt = path.extname(file.originalname)
					// Генерация имени файла используя UUID
					const filename = uuidv4() + fileExt
					cb(null, filename)
				}
			})
		})
	)
	async uploadAvatar(
		@Param('userId') userId: string,
		@UploadedFile() file: Express.Multer.File
	) {
		return this.userService.uploadAvatar(userId, file)
	}
}
