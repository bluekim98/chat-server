import { Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomPayloadDto } from './interface';
import { SendMsgDto } from './interface/msg.interface';

@WebSocketGateway(8080, {
    namespace: 'chat/room',
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
    },
})
export class ChatGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
    private static readonly logger = new Logger(ChatGateway.name);

    @WebSocketServer()
    server: Server;

    afterInit() {
        ChatGateway.logger.debug(`Socket Server Init Complete`);
    }

    handleConnection(client: Socket) {
        ChatGateway.logger.debug(
            `${client.id}(${client.handshake.query['username']}) is connected!`,
        );
    }

    handleDisconnect(client: Socket) {
        ChatGateway.logger.debug(`${client.id} is disconnected...`);
    }

    @SubscribeMessage('join')
    async joinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() roomDto: RoomPayloadDto,
    ): Promise<void> {
        const { roomId } = roomDto;
        await client.join(roomId);
    }

    @SubscribeMessage('leave')
    async leaveRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() roomDto: RoomPayloadDto,
    ): Promise<void> {
        const { roomId } = roomDto;
        await client.leave(roomId);
    }

    @SubscribeMessage('msg/server')
    async handleMessage(@MessageBody() sendMsgDto: SendMsgDto): Promise<void> {
        const { roomId, msg, userId } = sendMsgDto;
        this.server.to(roomId).emit('msg/client', sendMsgDto);
    }
}
