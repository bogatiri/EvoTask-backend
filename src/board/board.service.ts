import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { BoardDto } from './board.dto'

@Injectable()
export class BoardService {
	constructor(private prisma: PrismaService) {}

	async findById( id: string) {
		return this.prisma.board.findUnique({
			where: {
				id
			}
		})
	}

	async getAll(userId: string) {
		return this.prisma.board.findMany({
			where: {
				userId
			}
		})
	}

	async create(dto: BoardDto, userId: string) {
		return this.prisma.board.create({
			data: {
				...dto,
				creator: {
					connect: {
						id: userId
					}
				}
			}
		})
	}

	async update(dto: Partial<BoardDto>, boardId: string, userId: string) {
		return this.prisma.board.update({
			where: {
				userId,
				id: boardId
			},
			data: dto
		})
	}

	async delete(boardId: string) {
		return this.prisma.board.delete({
			where: {
				id: boardId
			}
		})
	}
}
