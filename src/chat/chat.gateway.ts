/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	SubscribeMessage,
	WebSocketGateway
} from '@nestjs/websockets'

@WebSocketGateway({
	cors: {
		origin: '*'
	}
})
export class SocketService implements OnGatewayConnection {
	@SubscribeMessage('server-path')
	handleEvent(@MessageBody() dto: any, @ConnectedSocket() client: any) {
		const res = { dto }
		client.emit('client-path', res)
	}

	handleConnection(client: any) {
		// console.log(client)
		// console.log('connected')
	}
}
