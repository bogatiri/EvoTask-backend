/* eslint-disable no-console */
import {
	Body,
	Controller,
	HttpCode,
	Param,
	Put,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { RoleService } from './roles.service'

@Controller('user/roles')
export class RolesController {
	constructor(private readonly rolesService: RoleService) {}



	// @Get()
	// @Auth()
	// async getAll(@CurrentUser('id') userId: string) {
	// 	return this.rolesService.getAll(userId)
	// }


	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put(':id')
	@Auth()
	async assignARole(
		@Body() body: any,
		@Param('id') id: string
	) {
		const {userId, boardId} = body 
		return this.rolesService.assignARole(userId, boardId, id)
	}

	// @UsePipes(new ValidationPipe())
	// @HttpCode(200)
	// @Post('copy')
	// @Auth()
	// async copyRoles(@Body() body: any) {
	// 	const { rolesId, boardId } = body
	// 	return this.rolesService.copyRoles(rolesId, boardId)
	// }


}
