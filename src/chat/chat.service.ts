import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { ChatDto } from './chat.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	async getAll(userId: string) {
		return this.prisma.chat.findMany({
			where: {
				userId
			}
		})
	}

	async create(dto: ChatDto, userId) {
		const { cardId, listId, boardId, ...otherData } = dto

		const createData: Prisma.ChatCreateInput = {
			...otherData,
			creator: { connect: { id: userId } }
		}

		if (cardId) {
			createData.card = { connect: { id: cardId } }
		}
		if (listId) {
			createData.list = { connect: { id: listId } }
		}
		if (boardId) {
			createData.board = { connect: { id: boardId } }
		}

		return this.prisma.chat.create({ data: createData })
	}

	async update(dto: Partial<ChatDto>, chatId: string, userId: string) {
		return this.prisma.chat.update({
			where: {
				userId,
				id: chatId
			},
			data: dto
		})
	}

	async delete(chatId: string) {
		return this.prisma.chat.delete({
			where: {
				id: chatId
			}
		})
	}
}
