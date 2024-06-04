import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { ChatDto } from './chat.dto'

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	async getorCreateChat(userId: string, boardId: string) {
		let chat = await this.prisma.chat.findFirst({
			where: {
				boardId: boardId
			}
		})

		if (!chat) {
			chat = await this.prisma.chat.create({
				data: {
					name: 'Chat for board',
					board: {
						connect: {
							id: boardId
						}
					},

				}
			})
		}
		return chat
	}

	async findById(id: string) {
		return this.prisma.chat.findFirst({
			where: {
				id
			},

			include: {
				messages:{
					include: {
						user: true
					}
				}
			}
		})
	}

	async create(dto: ChatDto) {
		const { cardId, listId, boardId, ...otherData } = dto

		const createData: Prisma.ChatCreateInput = {
			...otherData
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

	async update(dto: Partial<ChatDto>, chatId: string) {
		return this.prisma.chat.update({
			where: {
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
