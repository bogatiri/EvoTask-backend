import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { Jwtstrategy } from './jwt.strategy'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { getJwtConfig } from 'src/config/jwt.config'
import { UserModule } from 'src/user/user.module'

@Module({
	imports: [
		UserModule,
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig
		})
	],
	controllers: [AuthController],
	providers: [AuthService, Jwtstrategy]
})
export class AuthModule {}
