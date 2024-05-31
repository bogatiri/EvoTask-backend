import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class MessageService {
	constructor(private prisma: PrismaService) {}

	async getAll(userId: string) {
		return this.prisma.message.findMany({
			where: {
				userId
			},
			include: {
				user: true
			},
			orderBy: {
				createdAt:'asc'
			}
		})
	}

	async create(text: string,  chatId: string, userId: string,) {
		
		return this.prisma.message.create({
			data: {
				chat: {
					connect: {
						id: chatId
					}
				},
				user: {
					connect: {
						id: userId
					}
				},
				text
			},
			include: {
				user: true
			}
		})
	}

	async update(textUpdatedMessage: string, id: string, userId: string) {
		return this.prisma.message.update({
			where: {
				userId,
				id
			},
			data: {
				text: textUpdatedMessage
			},
			include: {
				user: true
			}
		})
	}

	async delete(id: string, userId: string) {
		// Найти сначала сообщение, чтобы убедиться, что оно принадлежит пользователю
		const message = await this.prisma.message.findFirst({
			where: {
				id,
				userId: userId,
			},
		});
	
		// Если сообщение не найдено или не принадлежит пользователю, выбросить исключение
		if (!message) {
			throw new Error('Message not found or you do not have permissions to delete this message.');
		}
	
		// Если сообщение принадлежит пользователю, тогда удаляем его
		return this.prisma.message.delete({
			where: {
				id,
			},
		});
	}
}
