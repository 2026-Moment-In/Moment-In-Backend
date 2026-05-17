import { Injectable } from '@nestjs/common';
const store = new Map<string, string>();

@Injectable()
export class QrService {
// qr.service.ts
create(data: any) {
  const code = Math.random().toString(36).slice(2, 9).toUpperCase();
  // 일단 메모리에 저장
  store.set(code, JSON.stringify(data));
  return { code };
}

// 조회
findOne(code: string) {
  return { data: store.get(code) || "데이터가 존재하지 않습니다."};
}
}