/* eslint-disable no-console */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Type_list } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { CardDto, CardOrderUpdateDto, CardUpdate } from './card.dto'

@Injectable()
export class CardService {
	constructor(private prisma: PrismaService) {}

	async findByListId(id: string) {
		return this.prisma.card.findMany({
			where: {
				listId: id
			},
			orderBy: {
				order: 'asc'
			}
		})
	}

	async addUserToCard(email: string, boardId: string, cardId: string) {
		const user = await this.prisma.user.findUnique({
			where: { email: email },
			include: {
				boards: true,
				cards: true
			}
		})

		if (!user) {
			throw new HttpException(
				`User with email ${email} not found`,
				HttpStatus.NOT_FOUND
			)
		}

		const operations = []
		const boardExist = user.boards.some(board => board.id === boardId)
		const cardExist = user.cards.some(card => card.id === cardId)

		if (cardExist) {
			throw new Error(`User already has this card`)
		}

		if (!boardExist) {
			operations.push(
				this.prisma.board.update({
					where: { id: boardId },
					data: {
						users: {
							connect: [{ id: user.id }]
						}
					}
				})
			)
		}

		if (!cardExist) {
			operations.push(
				this.prisma.card.update({
					where: { id: cardId },
					data: {
						users: {
							connect: [{ id: user.id }]
						}
					}
				}),
				this.prisma.user.update({
					where: { email: email },
					data: {
						boards: {
							connect: [{ id: boardId }]
						},
						cards: {
							connect: [{ id: cardId }]
						}
					}
				})
			)
		}

		if (!boardExist || !cardExist) {
			return await this.prisma.$transaction(operations)
		}
	}

	async getById(id: string) {
		return this.prisma.card.findUnique({
			where: {
				id
			},
			include: {
				users: true,
				comments: true
			}
		})
	}

	async getAll(userId: string) {
		return this.prisma.card.findMany({
			where: {
				userId
			},
			include: {
				users: true
			}
		})
	}

	async create(dto: CardDto, userId: string, list: string) {
		const currentMaxOrder = await this.prisma.card.count({
			where: { listId: list }
		})
		const currentList = await this.prisma.list.findUnique({
			where: {
				id: list
			}
		})

		const isCompleted = currentList.type === 'done' ? true : false
		const data: any = {
			...dto,
			list: {
				connect: {
					id: list
				}
			},
			creator: {
				connect: {
					id: userId
				}
			},
			completed: isCompleted,
			order: currentMaxOrder + 1
		}

		if (currentList.sprintId) {
			data.sprint = {
				connect: {
					id: currentList.sprintId
				}
			}
		}

		return this.prisma.card.create({
			data: data,
			include: {
				users: true
			}
		})
	}

	async createSubtask(dto: CardDto, parentId: string, userId: string) {
		return this.prisma.card.create({
			data: {
				...dto,
				parent: {
					connect: {
						id: parentId
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

	async pickCard(cardId: string, userId: string) {
		return await this.prisma.$transaction(async prisma => {
			const cardToPick = await this.prisma.card.findUnique({
				where: {
					id: cardId
				}
			})

			const newCard = await prisma.card.update({
				where: {
					id: cardId
				},
				data: {
					users: {
						connect: {
							id: userId
						}
					}
				}
			})

			await prisma.user.update({
				where: {
					id: userId
				},
				data: {
					cards: {
						connect: [cardToPick]
					}
				}
			})
			return newCard
		})
	}

	async copyCard(cardId: string, listId: string) {
		return await this.prisma.$transaction(async prisma => {
			const cardToCopy = await prisma.card.findUnique({
				where: { id: cardId },
				include: {
					users: true
				}
			})

			if (!cardToCopy) {
				throw new Error('Card to copy not found')
			}

			// Шаг 2: Увеличиваем order всех последующих карточек
			await prisma.card.updateMany({
				where: {
					listId: listId,
					order: { gte: cardToCopy.order }
				},
				data: {
					order: { increment: 1 }
				}
			})

			// Шаг 3: Создаем копию карточки с order, увеличенным на 1
			const newCard = await prisma.card.create({
				data: {
					...cardToCopy,
					id: undefined,
					name: `${cardToCopy.name} - copy`,
					order: cardToCopy.order + 1,
					users: {
						connect: cardToCopy.users.map(user => ({
							id: user.id
						}))
					},
					createdAt: new Date(), // Обновляем дату создания
					updatedAt: new Date() // Обновляем дату обновления
				},
				include: {
					users: true
				}
			})

			return newCard
		})
	}

	async update(dto: Partial<CardUpdate>, cardId: string) {
		const currentCard = await this.prisma.card.findUnique({
			where: { id: cardId },
			include: { list: true }
		})

		if (currentCard) {
			// Проверяем, изменилось ли состояние completed
			const isCompletedChanged =
				dto.completed !== undefined &&
				dto.completed !== currentCard.completed &&
				!currentCard.parentId

			if (isCompletedChanged) {
				let listTypeToFind
				if (dto.completed === true) {
					listTypeToFind = 'done'
				} else if (dto.completed === false) {
					listTypeToFind = currentCard.list.sprintId ? 'to_do' : 'backlog'
				}

				// Ищем целевую колонку
				const targetList = await this.prisma.list.findFirst({
					where: {
						boardId: currentCard.list.boardId,
						sprintId:
							listTypeToFind === 'to_do' || listTypeToFind === 'done'
								? currentCard.list.sprintId
								: null,
						type: listTypeToFind
					}
				})

				if (targetList) {
					// Обновляем listId если состояние completed действительно изменилось
					await this.prisma.card.update({
						where: { id: cardId },
						data: {
							...dto,
							listId: targetList.id
						}
					})
				}
			} else {
				// Обновляем карточку, но без изменения listId если состояние completed не изменилось
				await this.prisma.card.update({
					where: { id: cardId },
					data: dto
				})
			}
		}

		// Возвращаем обновлённую карточку
		return this.prisma.card.findUnique({
			where: { id: cardId }
		})
	}

	async moveCardToAnotherList(cardId: string, listId: string) {
		const destinationList = await this.prisma.list.findUnique({
			where: {
				id: listId
			}
		})

		const isCompleted =
			destinationList.type === ('done' as Type_list) ? true : false

		const data: any = {
			completed: isCompleted,
			list: {
				connect: {
					id: listId
				}
			}
		}

		if (destinationList.sprintId) {
			data.sprint = {
				connect: {
					id: destinationList.sprintId
				}
			}
		} else {
			data.sprint = {
				disconnect: true
			}
		}

		return this.prisma.card.update({
			where: {
				id: cardId
			},
			data
		})
	}

	async updateOrder(cardsWithNewOrder: CardOrderUpdateDto[]) {
		return this.prisma.$transaction(async prisma => {
			const updatePromises = cardsWithNewOrder.map(
				async ({ id, order, listId }) => {
					const list = await prisma.list.findUnique({
						where: { id: listId }
					})

					const completed = list?.type === 'done'

					const sprintIdUpdateCondition = list?.sprintId
						? { connect: { id: list.sprintId } }
						: { disconnect: true }

					return prisma.card.update({
						where: { id },
						data: {
							order,
							completed: completed ? true : false,
							sprint: sprintIdUpdateCondition,
							list: {
								connect: {
									id: listId
								}
							}
						}
					})
				}
			)

			return Promise.all(updatePromises)
		})
	}

	async delete(cardId: string) {
		return this.prisma.card.delete({
			where: {
				id: cardId
			}
		})
	}
}
