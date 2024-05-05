/* eslint-disable no-console */
import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { verify } from 'argon2'
import { Response } from 'express'
import { UserService } from 'src/user/user.service'
import { AuthDto } from './dto/auth.dto'
import * as nodemailer from 'nodemailer'
import { CheckCodeDto } from './dto/code.dto'
@Injectable()
export class AuthService {
	EXPIRE_DAY_REFRESH_TOKEN = 1
	REFRESH_TOKEN_NAME = 'refreshToken'

	constructor(
		private jwt: JwtService,
		private userService: UserService
	) {}

	async sendConfirmationCode(dto: AuthDto) {
    const user = await this.userService.getByEmail(dto.email);

    if (!user) throw new NotFoundException('User not found');
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
		const confirmationExpires = new Date(Date.now() + 60*60*1000)

		await this.userService.update(user.id, {
			confirmationCode,
			confirmationExpires
		});

		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL,
				pass: process.env.PASSWORD,
			}
		})

    const mailOptions = {
			from:process.env.EMAIL,
			to: dto.email,
			subject: 'Your confirmation code',
			text: `Use this code to confinr your sign-in: ${confirmationCode}`
		}

		await transporter.sendMail(mailOptions)

    return { message: 'Confirmation code sent to your email.' };
  }

	async checkConfirmationCode(checkCodeDto: CheckCodeDto, dto: AuthDto) {
		const user = await this.userService.getByEmail(checkCodeDto.email);
		
		
		if (user.confirmationCode === checkCodeDto.code && new Date() < user.confirmationExpires) {

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, confirmationCode, confirmationExpires, ...user } = await this.validateUser(dto)
			const tokens = this.issueTokens(user.id)
	
			return {
				user,
				...tokens
			}

			
			// await this.userService.clearConfirmationCode(user.id);
		} else {
			throw new UnauthorizedException('Неверный код подтверждения или его время истекло.');
		}
	}

	async login(dto: AuthDto) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, confirmationCode, confirmationExpires, ...user } = await this.validateUser(dto)
		const tokens = this.issueTokens(user.id)

		return {
			user,
			...tokens
		}
	}

	async register(dto: AuthDto) {
		const oldUser = await this.userService.getByEmail(dto.email)

		if (oldUser) throw new BadRequestException('User already exists')

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...user } = await this.userService.create(dto)

		const tokens = this.issueTokens(user.id)

		return {
			user,
			...tokens
		}
	}

	async getNewTokens(refreshToken: string) {
		const result = await this.jwt.verifyAsync(refreshToken)
		if (!result) throw new UnauthorizedException('Invalid refresh token')

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...user } = await this.userService.getById(result.id)

		const tokens = this.issueTokens(user.id)

		return {
			user,
			...tokens
		}
	}

	private issueTokens(userId: string) {
		const data = { id: userId }

		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h'
		})

		const refreshToken = this.jwt.sign(data, {
			expiresIn: '7d'
		})

		return { accessToken, refreshToken }
	}

	private async validateUser(dto: AuthDto) {
		const user = await this.userService.getByEmail(dto.email)

		if (!user) throw new NotFoundException('User not found')

		const isValid = await verify(user.password, dto.password)

		if (!isValid) throw new UnauthorizedException('Invalid password')

		return user
	}

	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		const expiresIn = new Date()
		expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)

		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			domain: 'localhost',
			expires: expiresIn,
			secure: true,
			// lax if production
			sameSite: 'none'
		})
	}

	removeRefreshTokenFromResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			domain: 'localhost',
			expires: new Date(0),
			secure: true,
			// lax if production
			sameSite: 'none'
		})
	}
}
