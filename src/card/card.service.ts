import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CardDto } from './card.dto'

@Injectable()
export class CardService {
	constructor(private prisma: PrismaService) {}

	async getAll(userId: string) {
		return this.prisma.card.findMany({
			where: {
				userId
			}
		})
	}

	async create(dto: CardDto, userId: string, listId: string) {
		return this.prisma.card.create({
			data: {
				...dto,
				list: {
					connect: {
						id: listId
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

	async update(dto: Partial<CardDto>, cardId: string, userId: string) {
		return this.prisma.card.update({
			where: {
				userId,
				id: cardId
			},
			data: dto
		})
	}

	async delete(cardId: string, userId: string) {
		return this.prisma.card.delete({
			where: {
				id: cardId,
				list: {
					board: {
						userId
					}
				}
			}
		})
	}
}
