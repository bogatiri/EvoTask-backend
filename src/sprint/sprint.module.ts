import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { SprintController } from './sprint.controller'
import { SprintService } from './sprint.service'

@Module({
	controllers: [SprintController],
	providers: [SprintService, PrismaService],
	exports: [SprintService]
})
export class SprintModule {}
