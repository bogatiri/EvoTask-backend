/* eslint-disable no-console */
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { ListDto, ListOrderUpdateDto } from './list.dto'

@Injectable()
export class ListService {
	constructor(private prisma: PrismaService) {}

	async findByBoardId(id: string){
		return this.prisma.list.findMany({
			where: {
				boardId: id,
				sprintId: null
			},
			orderBy: {
				order: ('asc')
			},
			include: {
				cards: {
					orderBy: {
						order: ('asc')
					},
					include: {
						users: true,
						creator: true,
						comments: {
							include: {
								user: true
							}
						}
					}
				}
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

	async create(dto: ListDto, board: string, userId: string,  sprintId?: string) {
		const currentMaxOrder = await this.prisma.list.count({
			where: { boardId: board },
		});
		const data: any = {
			...dto,
			board: {
				connect: {
					id: board
				}
			},
			creator: {
				connect: {
					id: userId
				}
			},
			order: currentMaxOrder + 1
		}

		if(sprintId) {
			data.sprint = {connect: {id: sprintId}}
		}

		return this.prisma.list.create({
			data: data, 
			include: {
				cards: true
			}
		})
	}

	async copyList(listId: string, boardId: string) {
		return await this.prisma.$transaction(async (prisma) => {
			const listToCopy = await prisma.list.findUnique({
				where: { id: listId },
				include: {
					cards: {
						include: {
							users: true
						}
					}
				}
			});
	

			if (!listToCopy) {
				throw new Error('List to copy not found');
			}
	
			await prisma.list.updateMany({
				where: {
					boardId: boardId,
					order: { gte: listToCopy.order },
				},
				data: {
					order: { increment: 1 },
				},
			});
	
			const newList = await prisma.list.create({
				data: {
					board: {
						connect: {
							id: boardId
						}
					}, 
					creator: {
						connect: {
							id: listToCopy.userId
						}
					},
					type: listToCopy.type,
					description: listToCopy.description,
					name: `${listToCopy.name} - copy`,
					order: listToCopy.order + 1,
				},
			});
	
			if (listToCopy.cards) {
				await Promise.all(listToCopy.cards.map(card => prisma.card.create({
					data: {
						list: {
							connect: {
								id: newList.id
							}
						} , // Новый созданный listId для карточки
						creator: {
							connect: {
								id: newList.userId
							}
						},
						name: card.name,
						description: card.description,
						order: card.order,
						users: {
							connect: card.users.map(user => ({ id: user.id }))
						},
						priority: card.priority
					},
					include:{ users: true}
				})));
			}
	
			const newCopiedListWithCards = await prisma.list.findUnique({
				where: { id: newList.id },
				include: {
					cards: {
						include: {
							users: true
						}
					},
				},
			});

			return newCopiedListWithCards;
		});
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
	
	async update(dto: Partial<ListDto>, id: string, userId: string) {
		return this.prisma.list.update({
			where: {
				userId,
				id
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
