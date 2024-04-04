import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { ListDto } from './list.dto'

@Injectable()
export class ListService {
	constructor(private prisma: PrismaService) {}

	async getAll(userId: string) {
		return this.prisma.list.findMany({
			where: {
				userId
			}
		})
	}

	async create(dto: ListDto, boardId: string, userId: string) {
		return this.prisma.list.create({
			data: {
				...dto,
				board: {
					connect: {
						id: boardId
					}
				},
				creator: {
					connect: {
						id: userId
					}
				}
			}
		})
	}

	async update(dto: Partial<ListDto>, listId: string, userId: string) {
		return this.prisma.list.update({
			where: {
				userId,
				id: listId
			},
			data: dto
		})
	}

	async delete(listId: string) {
		return this.prisma.list.delete({
			where: {
				id: listId
			}
		})
	}
}
