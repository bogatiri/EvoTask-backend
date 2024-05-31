import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CommentDto } from './comment.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class CommentService {
	constructor(private prisma: PrismaService) {}

	async getAll(userId: string) {
		return this.prisma.comment.findMany({
			where: {
				userId
			}
		})
	}

	async create(dto: CommentDto, userId) {
		const { cardId, listId, boardId, ...otherData } = dto

		const createData: Prisma.CommentCreateInput = {
			...otherData,
			user: { connect: { id: userId } }
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

		return this.prisma.comment.create({ data: createData, include: {user: true} })
	}

	async update(dto: Partial<CommentDto>, commentId: string, userId: string) {
		return this.prisma.comment.update({
			where: {
				userId,
				id: commentId
			},
			data: dto
		})
	}

	async delete(commentId: string) {
		return this.prisma.comment.delete({
			where: {
				id: commentId
			}
		})
	}
}
