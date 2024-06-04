/* eslint-disable no-console */
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { RolesDto } from './roles.dto'

@Injectable()
export class RoleService {
	constructor(private prisma: PrismaService) {}


  async assignARole(userId: string,boardId: string, id: string) {
		return await this.prisma.$transaction(async prisma => {
			const roleToAssign = await prisma.roles.update({
				where: {
					id,
					boardId
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
					roles: {
						connect: [roleToAssign] 
					}
				}
			})

			return roleToAssign

		})
	}


	async update(dto: Partial<RolesDto>, id: string) {
		return this.prisma.roles.update({
			where: {
				id
			},
			data: dto
		})
	}

}
