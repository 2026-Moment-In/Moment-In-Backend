import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { RecommendNearbyFacilitiesDto } from './dto/recommend-nearby-facilities.dto';

type NaverLocalItem = {
  title?: string;
  link?: string;
  category?: string;
  description?: string;
  telephone?: string;
  address?: string;
  roadAddress?: string;
  mapx?: string;
  mapy?: string;
};

type NaverImageItem = {
  title?: string;
  link?: string;
  thumbnail?: string;
};

type FacilityGroup = {
  label: string;
  keyword: string;
};

@Injectable()
export class NearbyFacilitiesService {
  private readonly defaultGroups: FacilityGroup[] = [
    { label: '카페', keyword: '카페' },
    { label: '편의점', keyword: '편의점' },
    { label: '공원', keyword: '공원' },
    { label: '맛집', keyword: '맛집' },
    { label: '주차장', keyword: '주차장' },
    { label: '포토스팟', keyword: '포토스팟' },
  ];

  async recommend(data: RecommendNearbyFacilitiesDto) {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException('NAVER_CLIENT_ID and NAVER_CLIENT_SECRET are required');
    }

    const venueName = this.cleanText(data.venueName);
    const venueAddress = this.cleanText(data.venueAddress);
    const baseQueries = this.buildBaseQueries(venueAddress, venueName);
    const baseQuery = baseQueries[0];

    if (!baseQuery) {
      throw new BadRequestException('venueAddress or venueName is required');
    }

    const count = this.clamp(Number(data.count) || 6, 1, 20);
    const groups = this.buildGroups(data);
    const resultsByGroup: { group: FacilityGroup; items: NaverLocalItem[] }[] = [];
    for (const group of groups) {
      resultsByGroup.push({
        group,
        items: await this.searchLocalWithFallback(venueAddress, venueName, group.keyword, clientId, clientSecret),
      });
    }

    const picked = this.pickRoundRobin(resultsByGroup, count);
    const facilities = await Promise.all(
      picked.map(async ({ item, group }) => {
        const placeName = this.stripHtml(item.title);
        const address = this.cleanText(item.roadAddress || item.address);
        const image = await this.searchImageSafe(
          [placeName, address || baseQuery].filter(Boolean).join(' '),
          clientId,
          clientSecret,
        );

        return {
          id: this.createId(item, group),
          placeName,
          place_name: placeName,
          categoryName: this.stripHtml(item.category),
          category_name: this.stripHtml(item.category),
          recommendationType: group.label,
          addressName: this.cleanText(item.address),
          address_name: this.cleanText(item.address),
          roadAddressName: this.cleanText(item.roadAddress),
          road_address_name: this.cleanText(item.roadAddress),
          phone: this.cleanText(item.telephone),
          x: item.mapx,
          y: item.mapy,
          mapx: item.mapx,
          mapy: item.mapy,
          link: item.link,
          naverMapUrl: this.createNaverMapUrl(placeName, address),
          imageUrl: image?.thumbnail || image?.link || '',
          imageSourceUrl: image?.link || '',
          imageTitle: this.stripHtml(image?.title),
          desc: [group.label, address, this.cleanText(item.telephone)].filter(Boolean).join(' · '),
        };
      }),
    );

    return {
      baseQuery,
      count: facilities.length,
      items: facilities,
    };
  }

  private buildGroups(data: RecommendNearbyFacilitiesDto): FacilityGroup[] {
    if (Array.isArray(data.keywords) && data.keywords.length > 0) {
      return data.keywords
        .map((keyword) => this.cleanText(keyword))
        .filter(Boolean)
        .slice(0, 10)
        .map((keyword) => ({ label: keyword, keyword }));
    }

    const recommendationType = this.cleanText(data.recommendationType);
    if (recommendationType) {
      return [{ label: recommendationType, keyword: recommendationType }];
    }

    return this.defaultGroups;
  }

  private buildBaseQueries(venueAddress: string, venueName: string) {
    const candidates = [
      [venueAddress, venueName].filter(Boolean).join(' '),
      venueAddress,
      venueName,
    ];

    return [...new Set(candidates.map((query) => this.cleanText(query)).filter(Boolean))];
  }

  private async searchLocalWithFallback(
    venueAddress: string,
    venueName: string,
    keyword: string,
    clientId: string,
    clientSecret: string,
  ) {
    for (const query of this.buildLocalSearchQueries(venueAddress, venueName, keyword)) {
      const addressParts = this.extractAddressParts(venueAddress);
      const items = (await this.searchLocalSafe(query, clientId, clientSecret))
        .filter((item) => this.isActualPlace(item, query, keyword))
        .filter((item) => this.isNearVenueArea(item, addressParts));
      if (items.length > 0) {
        return items;
      }
    }

    return [];
  }

  private async searchLocalSafe(query: string, clientId: string, clientSecret: string) {
    try {
      return await this.searchLocal(query, clientId, clientSecret);
    } catch {
      return [];
    }
  }

  private buildLocalSearchQueries(venueAddress: string, venueName: string, keyword: string) {
    const parts = this.extractAddressParts(venueAddress);
    const candidates = [
      venueName ? `${venueName} ${keyword}` : '',
      parts.district && parts.neighborhood ? `${parts.district} ${parts.neighborhood} ${keyword}` : '',
      parts.city && parts.district && parts.neighborhood ? `${parts.city} ${parts.district} ${parts.neighborhood} ${keyword}` : '',
      parts.neighborhood ? `${parts.neighborhood} ${keyword}` : '',
      parts.roadName ? `${parts.district} ${parts.roadName} ${keyword}` : '',
      parts.district ? `${parts.district} ${keyword}` : '',
      venueAddress ? `${venueAddress} ${keyword}` : '',
    ];

    return [...new Set(candidates.map((query) => this.cleanText(query)).filter(Boolean))];
  }

  private extractAddressParts(address: string) {
    const tokens = this.cleanText(address).split(' ').filter(Boolean);
    const city = tokens.find((token) => /(시|도)$/.test(token)) ?? tokens[0] ?? '';
    const district = tokens.find((token) => /(구|군)$/.test(token)) ?? '';
    const neighborhood = tokens.find((token) => /(동|읍|면|가)$/.test(token)) ?? '';
    const roadName = tokens.find((token) => /(로|길)(\d|$)/.test(token)) ?? '';

    return { city, district, neighborhood, roadName };
  }

  private async searchLocal(query: string, clientId: string, clientSecret: string) {
    const url = new URL('https://openapi.naver.com/v1/search/local.json');
    url.searchParams.set('query', query);
    url.searchParams.set('display', '5');
    url.searchParams.set('start', '1');
    url.searchParams.set('sort', 'comment');

    const data = await this.requestNaver<{ items?: NaverLocalItem[] }>(url, clientId, clientSecret);
    return data.items ?? [];
  }

  private async searchImageSafe(query: string, clientId: string, clientSecret: string) {
    try {
      return await this.searchImage(query, clientId, clientSecret);
    } catch {
      return null;
    }
  }

  private async searchImage(query: string, clientId: string, clientSecret: string) {
    const url = new URL('https://openapi.naver.com/v1/search/image.json');
    url.searchParams.set('query', query);
    url.searchParams.set('display', '1');
    url.searchParams.set('start', '1');
    url.searchParams.set('sort', 'sim');
    url.searchParams.set('filter', 'large');

    const data = await this.requestNaver<{ items?: NaverImageItem[] }>(url, clientId, clientSecret);
    return data.items?.[0] ?? null;
  }

  private async requestNaver<T>(url: URL, clientId: string, clientSecret: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new ServiceUnavailableException(`Naver API request failed: ${response.status} ${message}`);
    }

    return response.json() as Promise<T>;
  }

  private pickRoundRobin(resultsByGroup: { group: FacilityGroup; items: NaverLocalItem[] }[], count: number) {
    const picked: { group: FacilityGroup; item: NaverLocalItem }[] = [];
    const seen = new Set<string>();
    const maxRows = Math.max(...resultsByGroup.map(({ items }) => items.length), 0);

    for (let row = 0; row < maxRows && picked.length < count; row += 1) {
      for (const result of resultsByGroup) {
        const item = result.items[row];
        if (!item) {
          continue;
        }

        const key = this.createDedupKey(item);
        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        picked.push({ group: result.group, item });

        if (picked.length >= count) {
          break;
        }
      }
    }

    return picked;
  }

  private createDedupKey(item: NaverLocalItem) {
    return [this.stripHtml(item.title), item.roadAddress || item.address].join('|');
  }

  private createId(item: NaverLocalItem, group: FacilityGroup) {
    return Buffer.from(`${group.keyword}:${this.createDedupKey(item)}`).toString('base64url');
  }

  private createNaverMapUrl(placeName: string, address?: string) {
    return `https://map.naver.com/v5/search/${encodeURIComponent([placeName, address].filter(Boolean).join(' '))}`;
  }

  private isActualPlace(item: NaverLocalItem, baseQuery: string, keyword: string) {
    const title = this.stripHtml(item.title);
    if (!title) {
      return false;
    }

    const syntheticTitles = [
      `${baseQuery} 주변 ${keyword}`,
      `${baseQuery} ${keyword}`,
    ].map((value) => this.cleanText(value));

    if (syntheticTitles.includes(title)) {
      return false;
    }

    if (/주변\s*(음식점|카페|편의점|공원|맛집|주차장|포토스팟|문화시설|관광명소|숙박)$/.test(title)) {
      return false;
    }

    return true;
  }

  private isNearVenueArea(item: NaverLocalItem, venueArea: ReturnType<typeof this.extractAddressParts>) {
    const placeAddress = this.cleanText([item.roadAddress, item.address].filter(Boolean).join(' '));
    if (!placeAddress) {
      return true;
    }

    if (venueArea.district && !placeAddress.includes(venueArea.district)) {
      return false;
    }

    return true;
  }

  private stripHtml(value?: string) {
    return this.cleanText(value?.replace(/<\/?[^>]+(>|$)/g, ''));
  }

  private cleanText(value?: string) {
    return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
  }

  private clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }
}
