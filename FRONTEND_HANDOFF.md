# MomentIn Frontend Integration Handoff

작성일: 2026-05-20

이 문서는 현재 백엔드 실제 구현 기준입니다. 기존 기획서의 `/api` prefix, `/weddings/:id/photos` 형태와 다를 수 있으니 프론트 연동은 아래 내용을 기준으로 진행해 주세요.

## Local URLs

Backend:

```text
http://localhost:3000
```

Frontend `.env` 권장값:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000/live
VITE_FRONT_URL=http://localhost:5173
```

현재 백엔드는 global prefix `/api`를 사용하지 않습니다. 프론트에서 `/api/...`로 호출하면 404가 납니다.

## Frontend Build Issue

현재 프론트는 더미데이터 기반 화면에서 실제 API 호출 이름으로 넘어가는 중이라 `npm run build`가 실패합니다.

주요 원인:

- `src/api.ts`에 `api.devLogin()`, `api.getQr()`, `api.getPhotos()` 같은 메서드가 없음
- `src/types.ts`에 `Wedding`, `Photo`, `Guestbook` 타입이 없음
- `SOCKET_URL`, `DEMO_USER_ID` export가 없음
- 관리자 API 호출 시 `Authorization: Bearer <token>` 헤더가 붙지 않음
- 사진 업로드는 JSON이 아니라 `multipart/form-data`로 보내야 함
- 현재 `App.tsx` 라우팅에는 `DashboardPage`, `EditorPage`, `WeddingPage`, `LiveScreenPage`, `GalleryPage` 등이 연결되어 있지 않음

현재 연결된 `/create`, `/manage`, `/invite/:code`, `/rsvp/:code` 화면은 `useInviteStore` 더미 store를 사용합니다. 이 디자인을 유지하면서 백엔드에 붙이려면 해당 store 동작을 아래 API 호출로 바꾸면 됩니다.

프론트에서 `api.ts`, `types.ts`를 아래 API 계약에 맞춰 보강하면 됩니다.

## Auth

### Dev Login

```http
GET /auth/dev
```

로컬 개발용 로그인입니다. Kakao/Google 로그인 연결 전 관리자 화면 테스트에 사용합니다.

Response:

```json
{
  "access_token": "jwt-token",
  "user": {
    "id": "user-id",
    "provider": "local",
    "social_id": "dev-user",
    "display_name": "Dev User",
    "created_at": "2026-05-20T00:00:00.000Z"
  }
}
```

프론트는 `access_token`을 저장하고, 관리자 API 호출 시 아래 헤더를 붙여야 합니다.

```http
Authorization: Bearer <access_token>
```

## Weddings / Invitation

### Create My Wedding

```http
POST /weddings/my
Authorization: Bearer <token>
Content-Type: application/json
```

Body는 에디터의 invitation data 전체를 보내면 됩니다.

```json
{
  "groomName": "신랑",
  "brideName": "신부",
  "weddingDate": "2026-06-20",
  "weddingTime": "12:00",
  "venueName": "예식장",
  "venueAddress": "서울 ..."
}
```

Response:

```json
{
  "code": "abc12345",
  "wedding": {
    "id": "wedding-id",
    "admin_id": "user-id",
    "theme_code": "abc12345",
    "invitation_json": "{\"groomName\":\"신랑\"}",
    "wedding_date": "2026-06-20T00:00:00.000Z",
    "wedding_time": "12:00",
    "location_name": "예식장",
    "location_address": "서울 ...",
    "status": "active",
    "created_at": "2026-05-20T00:00:00.000Z"
  }
}
```

### Get My Weddings

```http
GET /weddings/my/list
Authorization: Bearer <token>
```

Response: `Wedding[]`

각 항목에는 `_count.photos`, `_count.guestbooks`가 포함됩니다.
RSVP 기능을 사용하는 경우 `_count.rsvps`도 포함됩니다.

### Get My Wedding Detail

```http
GET /weddings/my/:id
Authorization: Bearer <token>
```

Response: `Wedding`

관리자 상세 조회 응답에는 `invitation` 필드가 추가됩니다. `invitation_json`을 백엔드에서 파싱한 값입니다.

### Update My Wedding

```http
PATCH /weddings/my/:id
Authorization: Bearer <token>
Content-Type: application/json
```

Body는 Create와 동일하게 에디터 invitation data 전체를 보내면 됩니다.

### Delete My Wedding

```http
DELETE /weddings/my/:id
Authorization: Bearer <token>
```

실제 삭제가 아니라 `status: "deleted"`로 변경합니다.

### Public Wedding By Code

```http
GET /qr/:code
```

게스트 화면, QR 화면, 라이브 화면에서 사용하면 됩니다.

Response:

```json
{
  "code": "abc12345",
  "wedding": {
    "id": "wedding-id",
    "theme_code": "abc12345",
    "invitation_json": "{\"groomName\":\"신랑\"}",
    "wedding_date": "2026-06-20T00:00:00.000Z",
    "wedding_time": "12:00",
    "location_name": "예식장",
    "location_address": "서울 ..."
  },
  "data": {
    "groomName": "신랑",
    "brideName": "신부",
    "weddingDate": "2026-06-20",
    "weddingTime": "12:00",
    "venueName": "예식장",
    "venueAddress": "서울 ..."
  }
}
```

게스트 페이지에서는 `qr.wedding.id`로 사진/방명록/랭킹 API를 호출하면 됩니다.

### Increment View Count

```http
POST /weddings/code/:code/view
```

청첩장 상세 화면 최초 진입 시 1회 호출하면 됩니다. `GET /qr/:code`는 갤러리/라이브 화면에서도 주기적으로 호출될 수 있어서 조회수 증가와 분리했습니다.

Response: updated `Wedding`

## Photos

### Guest Photo List

```http
GET /photos/:weddingId
```

Response: `Photo[]`

숨김 처리된 사진은 제외됩니다.

### Admin Photo List

```http
GET /photos/admin/:weddingId
Authorization: Bearer <token>
```

Response: `Photo[]`

숨김 처리된 사진까지 포함됩니다.

### Upload Photo

```http
POST /photos
Content-Type: multipart/form-data
```

Form fields:

```text
file: File
weddingId: string
userId: string
displayName?: string
```

주의: 이 API는 JSON으로 보내면 안 됩니다. `FormData`를 사용하고 `Content-Type` 헤더는 브라우저가 자동으로 설정하게 두세요.

Response: `Photo`

### Like Photo

```http
POST /events/like/:photoId
```

Response: updated `Photo`

### Hide / Show Photo

```http
PATCH /photos/:photoId/hide
Authorization: Bearer <token>
```

```http
PATCH /photos/:photoId/show
Authorization: Bearer <token>
```

Response: updated `Photo`

## Ranking

### Top Ranking Photo Id

```http
GET /events/ranking/:weddingId
```

Response:

```json
"photo-id"
```

사진이 없으면 `null`입니다.

### Ranking List

```http
GET /events/ranking/:weddingId/top
```

Response: `Photo[]`

좋아요 수 내림차순, 생성일 오름차순으로 최대 10개 반환합니다.

## Guestbooks

### Guestbook List

```http
GET /guestbooks/:weddingId
```

Response: `Guestbook[]`

숨김 처리된 방명록은 제외됩니다.

### Admin Guestbook List

```http
GET /guestbooks/admin/:weddingId
Authorization: Bearer <token>
```

Response: `Guestbook[]`

숨김 처리된 방명록까지 포함됩니다.

### Create Guestbook

```http
POST /guestbooks
Content-Type: application/json
```

Body:

```json
{
  "weddingId": "wedding-id",
  "userId": "guest-user-id",
  "message": "결혼 축하해요!"
}
```

Response: `Guestbook`

### Hide / Show Guestbook

```http
PATCH /guestbooks/:guestbookId/hide
Authorization: Bearer <token>
```

```http
PATCH /guestbooks/:guestbookId/show
Authorization: Bearer <token>
```

Response: updated `Guestbook`

## RSVPs

현재 연결된 `RsvpPage`와 `ManagePage`의 참석 응답 기능을 백엔드에 붙이기 위한 API입니다.

### RSVP List

```http
GET /rsvps/:weddingId
```

Response: `Rsvp[]`

### Admin RSVP List

```http
GET /rsvps/admin/:weddingId
Authorization: Bearer <token>
```

Response: `Rsvp[]`

### Create RSVP

```http
POST /rsvps
Content-Type: application/json
```

Body:

```json
{
  "weddingId": "wedding-id",
  "userId": "guest-user-id",
  "name": "홍길동",
  "attendance": "yes",
  "guestCount": 2,
  "mealPreference": "한식",
  "message": "참석합니다"
}
```

`attendance`는 `"yes"`, `"no"`, `"undecided"` 중 하나입니다.

Response: `Rsvp`

### Delete RSVP

```http
DELETE /rsvps/:rsvpId
Authorization: Bearer <token>
```

Response: deleted `Rsvp`

## Socket.IO

Backend namespace:

```text
http://localhost:3000/live
```

프론트는 `socket.io-client`를 사용해야 합니다. 일반 `new WebSocket(...)` 방식이 아닙니다.

Join:

```ts
socket.emit("join-wedding", { weddingId });
```

Server events:

```text
photo-uploaded
photo-hidden
like-updated
```

Payload examples:

```ts
socket.on("photo-uploaded", (photo: Photo) => {});
socket.on("photo-hidden", ({ photoId }: { photoId: string }) => {});
socket.on("like-updated", ({ photoId, likeCount }: { photoId: string; likeCount: number }) => {});
```

## Suggested Frontend Types

```ts
export interface UserSummary {
  display_name: string;
}

export interface Wedding {
  id: string;
  admin_id?: string;
  theme_code?: string | null;
  invitation_json?: string | null;
  invitation?: Record<string, unknown> | null;
  wedding_date?: string | null;
  wedding_time?: string | null;
  location_name?: string | null;
  location_address?: string | null;
  status?: string;
  view_count?: number;
  created_at?: string;
  admin?: UserSummary;
  _count?: {
    photos: number;
    guestbooks: number;
    rsvps?: number;
  };
}

export interface Photo {
  id: string;
  wedding_id: string;
  user_id: string;
  image_url: string;
  like_count: number;
  is_hidden: boolean;
  created_at: string;
  user?: UserSummary;
}

export interface Guestbook {
  id: string;
  wedding_id: string;
  user_id: string;
  message: string;
  is_hidden: boolean;
  created_at: string;
  user?: UserSummary;
}

export interface Rsvp {
  id: string;
  wedding_id: string;
  user_id?: string | null;
  name: string;
  attendance: "yes" | "no" | "undecided";
  guest_count: number;
  meal_preference?: string | null;
  message?: string | null;
  created_at: string;
}

export interface QrResponse {
  code: string;
  wedding: Wedding;
  data: Record<string, unknown> | null;
}
```

## Suggested Frontend API Methods

`src/api.ts`에는 최소한 아래 메서드가 필요합니다.

```ts
export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000/live";

api.devLogin()
api.getQr(code)
api.createMyWedding(data)
api.getMyWeddings()
api.getMyWedding(id)
api.updateMyWedding(id, data)
api.deleteMyWedding(id)
api.getPhotos(weddingId)
api.getAdminPhotos(weddingId)
api.uploadPhoto(weddingId, file, userId, displayName?)
api.likePhoto(photoId)
api.getRanking(weddingId)
api.getGuestbooks(weddingId)
api.getAdminGuestbooks(weddingId)
api.createGuestbook(weddingId, message, userId)
api.hidePhoto(photoId)
api.showPhoto(photoId)
api.hideGuestbook(guestbookId)
api.showGuestbook(guestbookId)
api.incrementViewCount(code)
api.getRsvps(weddingId)
api.getAdminRsvps(weddingId)
api.createRsvp(weddingId, payload)
api.deleteRsvp(rsvpId)
```

관리자용 API는 `localStorage.getItem("momentin_access_token")` 값을 Bearer token으로 붙여 주세요.

## Frontend Work Checklist

- `src/api.ts`에 위 메서드 추가
- `src/types.ts`에 `Wedding`, `Photo`, `Guestbook`, `QrResponse` 추가
- `SOCKET_URL`, `DEMO_USER_ID` export 추가
- 관리자 API 호출 시 Bearer token 추가
- 사진 업로드는 `FormData`로 구현
- RSVP 화면을 유지한다면 `/rsvps` API로 store 동작 교체
- 청첩장 조회수는 상세 화면 최초 진입 시 `POST /weddings/code/:code/view` 호출
- `App.tsx`에 실제 사용할 페이지 라우트 연결 확인
- `npm run build` 통과 확인
- 게스트 페이지에서 `/qr/:code` -> `wedding.id` -> photos/ranking/guestbooks 순서로 로드
- 관리자 페이지에서 dev login 후 `/weddings/my/list`, `/weddings/my/:id` 로드 확인

## Backend Verification

확인 완료:

- Backend `npm run build` 통과
- 실제 구현된 컨트롤러 기준으로 엔드포인트 정리

현재 프론트 `npm run build`는 API wrapper/type 미구현으로 실패합니다.
