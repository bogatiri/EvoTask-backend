/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { AuthService } from 'src/auth/auth.service'
import { MessageService } from 'src/message/message.service'
@WebSocketGateway({
	cors: {
		origin: '*'
	}
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	public server: Server

	constructor(
		private authService: AuthService,
		private messageService: MessageService
	) {}
	private clients: Map<string, string> = new Map()

	async handleConnection(client: Socket, ...args: any[]) {
		try {
			const token = client.handshake.query.authToken
			let authToken: string
			if (Array.isArray(token)) {
				authToken = token[0]
			} else {
				authToken = token
			}
			const userId = await this.authService.getUserIdFromToken(authToken)

			this.clients.set(client.id, userId)
		} catch (error) {
			console.error(error)
			client.disconnect()
		}
	}

	handleDisconnect(client: Socket) {
		this.clients.delete(client.id)
	}

	@SubscribeMessage('joinRoom')
	handleJoinRoom(
		@MessageBody() data: { chatId: string },
		@ConnectedSocket() client: Socket
	): void {
		const { chatId } = data
		client.join(chatId)
	}

	@SubscribeMessage('send-message')
	async handleMessage(
		@MessageBody() body: { text: string; chatId: string },
		@ConnectedSocket() client: Socket
	): Promise<void> {
		const userId = this.clients.get(client.id)
		const { text, chatId } = body

		if (!userId) {
			return
		}

		try {
			const message = await this.messageService.create(text, chatId, userId)
			this.server.to(message.chatId).emit('new-message', message)
		} catch (error) {
			console.error(error)
			client.emit('message-error', { error: 'Не удалось сохранить сообщение' })
		}
	}
}
