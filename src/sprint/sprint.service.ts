import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { SprintDto } from './sprint.dto'
import { Type_list } from '@prisma/client'

@Injectable()
export class SprintService {
	constructor(private prisma: PrismaService) {}

	async getAll(id: string) {
		return this.prisma.sprint.findMany({
			where: {
				boardId: id
			},
			orderBy: {
				createdAt:'asc'
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
							include: {
								users: true,
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
		});
	}

	async create(dto: SprintDto, userId, boardId) {
		return await this.prisma.$transaction(async (prisma) => {
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
					},
				},
			});
	
			const listTypes = ['to_do', 'in_progress', 'done'];
	
			const lists = await Promise.all(
				listTypes.map((type, index) => 
					prisma.list.create({
						data: {
							name: 'qwe',
							type: type as Type_list,
							order: index + 1,
							creator: {
								connect: {
									id: userId
								}
							},
							board: {
								connect: {
									id: boardId
								}
							},
							sprint: {
								connect: {
									id: sprint.id
								}
							},
						}
					})
				)
			);
	

			return { sprint, lists };
		});
	}

	async update(dto: Partial<SprintDto>, sprintId: string, userId: string) {
		return this.prisma.sprint.update({
			where: {
				userId,
				id: sprintId
			},
			data: dto
		})
	}

	async delete(sprintId: string) {
		return this.prisma.sprint.delete({
			where: {
				id: sprintId
			}
		})
	}
}
