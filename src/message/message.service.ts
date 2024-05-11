import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { MessageDto } from './message.dto'

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

	async update(dto: Partial<MessageDto>, messageId: string, userId: string) {
		return this.prisma.message.update({
			where: {
				userId,
				id: messageId
			},
			data: dto
		})
	}

	async delete(messageId: string, userId: string) {
		return this.prisma.message.delete({
			where: {
				id: messageId,
				userId
			}
		})
	}
}
