import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { RolesController } from './roles.controller'
import { RoleService } from './roles.service'

@Module({
	controllers: [RolesController],
	providers: [RoleService, PrismaService],
	exports: [RoleService]
})
export class RolesModule {}
