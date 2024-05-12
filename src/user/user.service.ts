import { Injectable } from '@nestjs/common'
import { hash } from 'argon2'
import { AuthDto } from 'src/auth/dto/auth.dto'
import { PrismaService } from 'src/prisma.service'
import { UserDto } from './user.dto'
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { startOfDay, subDays } from 'date-fns'

@Injectable()
export class UserService {
	private readonly uploadPath = 'uploads/avatars'

	constructor(private prisma: PrismaService) {
		const fullUploadPath = path.resolve(this.uploadPath);
    if (!fs.existsSync(fullUploadPath)) {
      fs.mkdirSync(fullUploadPath, { recursive: true });
	}
}


async findById(id: string) {
	return this.prisma.user.findUnique({
		where: {
			id
		}
	})
}

async uploadAvatar(userId: string, file: Express.Multer.File): Promise<string> {
	// Генерация уникального имени файла
	// Вы можете использовать оригинальное имя файла или добавить дополнительные проверки
	const fileExt = path.extname(file.originalname);
	const fileName = uuidv4() + fileExt;
	
	// Полный путь к новому файлу
	const filePath = path.join(this.uploadPath, fileName);

	// Асинхронное перемещение файла в целевую директорию
	fs.promises.rename(file.path, filePath);

	// Обновление URL аватара в базе данных
	const avatar = path.join('/static', this.uploadPath, fileName);
	await this.prisma.user.update({
		where: { id: userId },
		data: { avatar }
	});

	// Вернуть URL, по которому будет доступен аватар
	return avatar;
}


	getById(id: string) {
		return this.prisma.user.findUnique({
			where: {
				id
			},
			include: {
				tasks: true,
				boards: true
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

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...rest } = profile

		return {
			user: rest,
			statistics: [
				{ label: 'Total', value: totalTasks },
				{ label: 'Completed tasks', value: completedTasks },
				{ label: 'Today tasks', value: todayTasks },
				{ label: 'Week tasks', value: weekTasks }
			]
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
