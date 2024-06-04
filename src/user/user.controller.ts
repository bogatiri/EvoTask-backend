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
	@Post('/avatar')
	@Auth()
	async getAvatar(
		@Body() avatar: any
	) {
		const image = avatar.avatar
		return this.userService.getAvatar( image )
	}

	@Post(':id')
	@UseInterceptors(
		FileInterceptor('avatar', {
			storage: multer.diskStorage({
				destination: './static/uploads/temp',
				filename: (req, file, cb) => {
					const fileExt = path.extname(file.originalname)
					// Генерация имени файла используя UUID
					const filename = uuidv4() + fileExt
					cb(null, filename)
				}
			})
		})
	)
	async uploadAvatar(
		@Param('id') id: string,
		@UploadedFile() file: Express.Multer.File
	) {
		return this.userService.uploadAvatar(id, file)
	}

	


}
