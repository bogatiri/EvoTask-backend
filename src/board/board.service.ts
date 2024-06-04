/* eslint-disable no-console */
import { Injectable } from '@nestjs/common'
import { Name_Roles } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { BoardDto } from './board.dto'

@Injectable()
export class BoardService {
	constructor(private prisma: PrismaService) {}

	async findById(id: string) {
		return this.prisma.board.findUnique({
			where: {
				id
			},
			include: {
				sprints:{

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
				} ,			
				users: {
					include: {
						roles: true
					}
				},
				roles: {
					include: {
						users: true
					}
				},
				chats: {
					include: {
						messages: {
							include: {
								user: true
							},
							orderBy: {
								createdAt: 'asc'
							}
						}
					}
				}
			}
		})
	}

	async addUserToBoard(email: string, boardId: string) {
		const user = await this.prisma.user.findUnique({
			where: { email: email },
			include: {
				boards: true
			}
		})

		if (!user) {
			throw new Error(`User with email ${email} not found`)
		}

		const boardExist = user.boards.some(board => board.id === boardId)
		if (boardExist) {
			throw new Error(`User already on board`)
		}
		if (!boardExist) {
			return this.prisma.$transaction([
				this.prisma.board.update({
					where: { id: boardId },
					data: {
						users: {
							connect: [{ id: user.id }] // Связываем пользователя с доской
						}
					}
				}),
				this.prisma.user.update({
					where: { email: email },
					data: {
						boards: {
							connect: [{ id: boardId }] // Связываем доску с пользователем
						}
					}
				})
			])
		}
	}

	async getAll(userId: string) {
		return this.prisma.board.findMany({
			where: {
				OR: [
					{
						userId
					},
					{
						users: {
							some: {
								id: userId
							}
						}
					}
				]
			},
			include: {
				chats: true
			}
		})
	}

	async create(dto: BoardDto, userId: string) {
		return await this.prisma.$transaction(async prisma => {
			const board = await this.prisma.board.create({
				data: {
					...dto,
					creator: {
						connect: {
							id: userId
						}
					},
					users: {
						connect: {
							id: userId
						}
					},
					chats: {
						create: {
							name: 'board'
						}
					}
				},
				include: {
					chats: true
				}
			})

			const name_roles = ['scrum_master', 'project_owner', 'team_member']

			const roles = await Promise.all(
				name_roles.map(name =>
					prisma.roles.create({
						data: {
							name: name as Name_Roles,
							board: {
								connect: {
									id: board.id
								}
							},
						},
						include: {
							users: true
						}
					})
				)
			)

			return { board, roles }
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
