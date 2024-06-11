/* eslint-disable no-console */
import { Injectable } from '@nestjs/common'
import { hash } from 'argon2'
import { startOfDay, subDays } from 'date-fns'
import * as fs from 'fs'
import * as path from 'path'
import { AuthDto } from 'src/auth/dto/auth.dto'
import { PrismaService } from 'src/prisma.service'
import { v4 as uuidv4 } from 'uuid'
import { UserDto } from './user.dto'

@Injectable()
export class UserService {
	private readonly uploadPath = 'static/uploads/avatars'

	constructor(private prisma: PrismaService) {
		const fullUploadPath = path.resolve(this.uploadPath)
		if (!fs.existsSync(fullUploadPath)) {
			fs.mkdirSync(fullUploadPath, { recursive: true })
		}
	}

	async getAvatar(image: string) {
		const basePath = path.join(__dirname, '..', '..')
		const fullPath = path.join(basePath, image)
		const avatarBuffer = await fs.promises.readFile(fullPath)

		const avatarBase64 = avatarBuffer.toString('base64')

		const avatarDataURL = `data:image/jpeg;base64,${avatarBase64}`
		return avatarDataURL
	}

	async findById(id: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				id
			},
			include: {
				roles: true,
				cards: true
			}
		})


		try {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, avatar, ...rest } = user

			return {
				...rest,
				avatar: avatar.includes('static/uploads') ? await this.getAvatar(user.avatar) : user.avatar
			}
		} catch (err) {
			console.error('Ошибка при чтении файла аватара:', err)
		}
	}

	async clearConfirmationCode(userId: string){
		return await this.prisma.user.update({
			where: {
				id: userId, // ID пользователя, у которого нужно очистить код
			},
			data: {
				confirmationCode: null,
				confirmationExpires: null 
			},
		});
	}

	async uploadAvatar(
		userId: string,
		file: Express.Multer.File
	): Promise<string> {
		// const fileExt = path.extname(file.originalname);
		const fileName = uuidv4()
		const filePath = path.join(this.uploadPath, fileName)

		fs.promises.rename(file.path, filePath)
		const avatar = path.join(this.uploadPath, fileName)
		await this.prisma.user.update({
			where: { id: userId },
			data: { avatar }
		})

		return avatar
	}

	getById(id: string) {
		return this.prisma.user.findUnique({
			where: {
				id
			},
			include: {
				tasks: true,
				boards: true,
				roles: true
			}
		})
	}

	getByEmail(email: string) {
		return this.prisma.user.findUnique({
			where: {
				email
			}
		})
	}

	async getProfile(id: string) {
		const profile = await this.getById(id)

		const totalTasks = profile.tasks.length
		const completedTasks = await this.prisma.task.count({
			where: {
				userId: id,
				isCompleted: true
			}
		})

		const todayStart = startOfDay(new Date())
		const weekStart = startOfDay(subDays(new Date(), 7))

		const todayTasks = await this.prisma.task.count({
			where: {
				userId: id,
				createdAt: {
					gte: todayStart.toISOString()
				}
			}
		})

		const weekTasks = await this.prisma.task.count({
			where: {
				userId: id,
				createdAt: {
					gte: weekStart.toISOString()
				}
			}
		})

		try {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, avatar, ...rest } = profile

			const userAvatar = avatar.includes('static/uploads') ? await this.getAvatar(profile.avatar) : profile.avatar

			return {
				user: {
					...rest,
					avatar: userAvatar
				},
				statistics: [
					{ label: 'Total', value: totalTasks },
					{ label: 'Completed tasks', value: completedTasks },
					{ label: 'Today tasks', value: todayTasks },
					{ label: 'Week tasks', value: weekTasks }
				]
			}
		} catch (err) {
			console.error('Ошибка при чтении файла аватара:', err)
		}
	}

	async create(dto: AuthDto) {
		const user = {
			email: dto.email,
			name: '',
			password: await hash(dto.password)
		}

		return this.prisma.user.create({
			data: user
		})
	}

	async update(id: string, dto: UserDto) {
		let data = dto

		if (dto.password) {
			data = { ...dto, password: await hash(dto.password) }
		}

		return this.prisma.user.update({
			where: {
				id
			},
			data
		})
	}
}
