import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { ListDto, ListOrderUpdateDto } from './list.dto'

@Injectable()
export class ListService {
	constructor(private prisma: PrismaService) {}

	async findByBoardId(id: string){
		return this.prisma.list.findMany({
			where: {
				boardId: id
			},
			orderBy: {
				order: ('asc')
			},
			include: {
				cards: true
			}
		})
	}

	async getAll(userId: string) {
		return this.prisma.list.findMany({
			where: {
				userId
			},
			orderBy: {
				order: ('asc')
			}
		})
	}

	async create(dto: ListDto, boardId: string, userId: string) {
		const currentMaxOrder = await this.prisma.list.count({
			where: { boardId },
		});
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
				},
				order: currentMaxOrder + 1
			}
		})
	}

	async updateOrder(listsWithNewOrder: ListOrderUpdateDto[]) {
		return this.prisma.$transaction(async prisma => {
			const updatePromises = listsWithNewOrder.map(({ id, order }) =>
				prisma.list.update({
					where: { id },
					data: { order },
				})
			)
				
			return Promise.all(updatePromises)
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
