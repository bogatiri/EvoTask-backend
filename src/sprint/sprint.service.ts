/* eslint-disable no-console */
import { Injectable } from '@nestjs/common'
import { Type_list } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { SprintDto } from './sprint.dto'

@Injectable()
export class SprintService {
	constructor(private prisma: PrismaService) {}

	async getAll(id: string) {
		return this.prisma.sprint.findMany({
			where: {
				boardId: id
			},
			orderBy: {
				createdAt: 'asc'
			}
		})
	}

	async getById(id: string) {
		return this.prisma.sprint.findUnique({
			where: {
				id
			},
			include: {
				list: {
					orderBy: {
						order: 'asc'
					},
					include: {
						cards: {
							orderBy: {
								order: 'asc'
							},
							include: {
								users: true,
								creator: true,
								subtasks: {
									orderBy: {
										createdAt: 'asc'
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
								},
								comments: {
									include: {
										user: true
									}
								}
							}
						}
					}
				}
			}
		})
	}

	async create(dto: SprintDto, userId: string, boardId: string) {
		return await this.prisma.$transaction(async prisma => {
			const sprint = await prisma.sprint.create({
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

			const listTypes = ['to_do', 'in_progress', 'done', 'blocked', 'feedback']

			const listNames =['Новые задачи', 'В работе', 'Выполнены', 'Отменены', 'На проверке']

			const lists = await Promise.all(
				listTypes.map((type, index) =>
					prisma.list.create({
						data: {
							name: listNames[index],
							type: type as Type_list,
							order: index + 1,
							board: {
								connect: {
									id: boardId
								}
							},
							sprint: {
								connect: {
									id: sprint.id
								}
							}
						}
					})
				)
			)

			return { sprint, lists }
		})
	}

	async update(dto: Partial<SprintDto>, sprintId: string, userId: string) {
		const sprintWithBoard = await this.prisma.sprint.findUnique({
			where: {
				id: sprintId
			},
			include: {
				board: true
			}
		})

		if (!sprintWithBoard && userId) {
			throw new Error('Sprint not found')
		}

		const boardRoles = await this.prisma.roles.findMany({
			where: {
				boardId: sprintWithBoard.boardId
			},
			include: {
				users: true
			}
		})


		if (boardRoles[0].users.length === 0) {
			return {
				success: false,
				message: 'Only scrum master can update sprint'
			}
		}


		if (!(boardRoles[0].users[0].id === userId)) {
			return {
				success: false,
				message: 'Only scrum master can update sprint'
			}
		}

		if (boardRoles[0].users[0].id === userId) {
			const updatedSprint = await this.prisma.sprint.update({
				where: {
					id: sprintId
				},
				data: dto
			})
			return {
				success: true,
				message: 'Sprint updated successfully',
				data: updatedSprint 
			}
		}
	}

	async delete( sprintId: string, userId: string) {
		const sprintWithBoard = await this.prisma.sprint.findUnique({
			where: {
				id: sprintId
			},
			include: {
				board: true
			}
		})

		if (!sprintWithBoard && userId) {
			throw new Error('Sprint not found')
		}

		const boardRoles = await this.prisma.roles.findMany({
			where: {
				boardId: sprintWithBoard.boardId
			},
			include: {
				users: true
			}
		})


		if (boardRoles[0].users.length === 0) {
			return {
				success: false,
				message: 'Only scrum master can delete sprint'
			}
		}


		if (!(boardRoles[0].users[0].id === userId)) {
			return {
				success: false,
				message: 'Only scrum master can delete sprint'
			}
		}

		if (boardRoles[0].users[0].id === userId) {
				await this.prisma.sprint.delete({
				where: {
					id: sprintId
				},
			})
			return {
				success: true,
				message: 'Sprint updated successfully',
			}
		}
	}
}
