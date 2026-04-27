import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventsService } from './events.service';

@WebSocketGateway({
    cors: {
        origin: '*', // 실제 배포 시에는 프론트엔드 도메인으로 제한하세요.
    },
    namespace: '/live', // 엔드포인트 네임스페이스
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly eventsService: EventsService) { }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    // 1. 특정 예식장(Room) 입장 로직
    @SubscribeMessage('joinWedding')
    handleJoinWedding(
        @ConnectedSocket() client: Socket,
        @MessageBody('weddingId') weddingId: string,
    ) {
        client.join(weddingId);
        console.log(`Client ${client.id} joined wedding: ${weddingId}`);
        return { event: 'joined', data: { weddingId } };
    }

    // 2. 좋아요 클릭 이벤트 처리 및 랭킹 갱신 
    @SubscribeMessage('likePhoto')
    async handleLikePhoto(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { weddingId: string; photoId: string },
    ) {
        // DB의 like_count 증감 로직 호출 [cite: 21, 47]
        const updatedPhoto = await this.eventsService.incrementLike(payload.photoId);

        // 랭킹 재계산 알고리즘 실행 [cite: 22] 및 1위 정보 가져오기 [cite: 19]
        const topRankingPhotoId = await this.eventsService.getTopRankedPhoto(payload.weddingId);

        // 해당 예식장(Room)의 모든 클라이언트에게 실시간 좋아요 수 및 랭킹 UI 갱신 이벤트 전송 
        this.server.to(payload.weddingId).emit('updateRanking', {
            photoId: updatedPhoto.id,
            likeCount: updatedPhoto.like_count,
            topRankedPhotoId: topRankingPhotoId, // 1위에게 왕관 부여를 위한 데이터 [cite: 19, 21]
        });
    }

    // (REST API용) 사진 업로드 완료 시, 컨트롤러에서 이 메서드를 호출하여 라이브 스크린에 즉시 반영 
    broadcastNewPhoto(weddingId: string, photoData: any) {
        this.server.to(weddingId).emit('newPhoto', photoData);
    }
}