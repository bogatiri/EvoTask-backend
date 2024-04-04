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
			}
		})
	}

	async create(dto: MessageDto, userId: string, chatId: string) {
		return this.prisma.message.create({
			data: {
				...dto,
				chat: {
					connect: {
						id: chatId
					}
				},
				user: {
					connect: {
						id: userId
					}
				}
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
