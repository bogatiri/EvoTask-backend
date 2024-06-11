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


		if (user.confirmationExpires && new Date(user.confirmationExpires) > new Date()) {

			return { message: 'Confirmation code is still valid.' };
		}

    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
		const confirmationExpires = new Date(Date.now() + 60*5*1000)

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
			html: `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body {
						font-family: 'Arial', sans-serif;
						background-color: #f4f4f4;
						margin: 0;
						padding: 0;
					}
					.container {
						width: 90%;
						max-width: 550px;
						margin: 0 auto;
						background-color: #ffffff;
						box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
						padding: 20px;
					}
					.header {
						background-color: #4285f4;
						color: #ffffff;
						padding: 10px 20px;
						text-align: center;
					}
					.content {
						padding: 20px;
					}
					h1 {
						color: #333333;
					}
					p {
						font-size: 16px;
						line-height: 1.5;
						color: #666666;
					}
					.code {
						font-size: 24px;
						font-weight: bold;
						color: #4285f4;
					}
					.footer {
						margin-top: 20px;
						padding-top: 20px;
						border-top: 1px solid #dddddd;
						text-align: center;
						font-size: 12px;
						color: #999999;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>Your Confirmation Code</h1>
					</div>
					<div class="content">
						<p>Use the following code to confirm your sign-in:</p>
						<p class="code">${confirmationCode}</p>
						<p>This code will expire in 5 minutes.</p>
					</div>
					<div class="footer">
						<p>If you did not request this code, you can safely ignore this email.</p>
					</div>
				</div>
			</body>
			</html>
		`
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
			await this.userService.clearConfirmationCode(user.id)

			return {
				user,
				...tokens
			}
			
		} else {
			return { message: 'Неверный код подтверждения или пароль' };
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

	async getUserIdFromToken(token: string): Promise<string> {
    try {
      // Валидируем и расшифровываем токен с помощью JwtService
      const payload = await this.jwt.verifyAsync(token);
      // Удостоверяемся, что payload содержит поле id
      if (!payload || typeof payload.id !== 'string') {
        throw new UnauthorizedException('Invalid token');
      }

      // Если все проверки пройдены, возвращаем userId из токена
      return payload.id;
    } catch (e) {
			console.error(e)
      // Обрабатываем ошибки, связанные с JWT, и выбрасываем исключения
      throw new UnauthorizedException('Invalid token');
    }
  }

	private issueTokens(userId: string) {
		const data = { id: userId }

		const accessToken = this.jwt.sign(data, {
			expiresIn: '1d'
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
			domain: process.env.DOMAIN,
			expires: expiresIn,
			secure: false,
			// lax if production
			sameSite: 'lax'
		})
	}

	removeRefreshTokenFromResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			domain: process.env.DOMAIN,
			expires: new Date(0),
			secure: false,
			// lax if production
			sameSite: 'lax'
		})
	}
}
