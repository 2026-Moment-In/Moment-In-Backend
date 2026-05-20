import { Injectable } from '@nestjs/common';
import { WeddingsService } from '../weddings/weddings.service';

@Injectable()
export class QrService {
  constructor(private readonly weddingsService: WeddingsService) {}

  async create(data: unknown) {
    const result = await this.weddingsService.createWeddingFromInvitation(data);
    return {
      code: result.code,
      weddingId: result.wedding.id,
    };
  }

  async findOne(code: string) {
    return this.weddingsService.getInvitationByCode(code);
  }
}
