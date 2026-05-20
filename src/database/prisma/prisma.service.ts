import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

type Where = Record<string, unknown>;
type Query = {
  where?: Where;
  data?: Record<string, any>;
  include?: Record<string, any>;
  select?: Record<string, boolean>;
  orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
  take?: number;
};

const demoUserId = '00000000-0000-0000-0000-000000000001';
const demoWeddingId = '4JIQ56L';

@Injectable()
export class PrismaService {
  private readonly users = [
    {
      id: demoUserId,
      provider: 'demo',
      social_id: 'demo-user',
      display_name: '데모 하객',
      created_at: new Date().toISOString(),
    },
  ];

  private readonly weddings = [
    {
      id: demoWeddingId,
      admin_id: demoUserId,
      theme_code: 'classic',
      wedding_date: '2026-06-20T12:00:00.000Z',
      location_name: 'Moment Hall',
      location_address: '서울특별시 강남구 테헤란로 123',
      status: 'active',
      created_at: new Date().toISOString(),
    },
  ];

  private readonly photos = [
    {
      id: 'demo-photo-1',
      wedding_id: demoWeddingId,
      user_id: demoUserId,
      image_url:
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
      like_count: 3,
      is_hidden: false,
      created_at: new Date().toISOString(),
    },
  ];

  private readonly guestbooks = [
    {
      id: 'demo-guestbook-1',
      wedding_id: demoWeddingId,
      user_id: demoUserId,
      message: '결혼을 진심으로 축하합니다!',
      is_hidden: false,
      created_at: new Date().toISOString(),
    },
  ];

  private readonly rsvps = [
    {
      id: 'demo-rsvp-1',
      wedding_id: demoWeddingId,
      user_id: demoUserId,
      name: 'Demo Guest',
      attendance: 'yes',
      guest_count: 1,
      meal_preference: null,
      message: null,
      created_at: new Date().toISOString(),
    },
  ];

  readonly user = this.createModel(this.users);
  readonly wedding = this.createModel(this.weddings, { admin: this.users });
  readonly photo = this.createModel(this.photos, { user: this.users });
  readonly guestbook = this.createModel(this.guestbooks, { user: this.users });
  readonly rsvp = this.createModel(this.rsvps, { wedding: this.weddings });

  private createModel(rows: any[], relations: Record<string, any[]> = {}) {
    return {
      findUnique: async (query: Query) =>
        this.decorate(this.findFirst(rows, query.where), query, relations),

      findFirst: async (query: Query) => {
        const filtered = this.filterRows(rows, query.where);
        const sorted = this.sortRows(filtered, query.orderBy);
        return this.decorate(sorted[0] ?? null, query, relations);
      },

      findMany: async (query: Query = {}) => {
        const filtered = this.filterRows(rows, query.where);
        const sorted = this.sortRows(filtered, query.orderBy);
        const sliced = query.take ? sorted.slice(0, query.take) : sorted;
        return sliced.map((row) => this.decorate(row, query, relations));
      },

      create: async (query: Query) => {
        const row = {
          id: query.data?.id ?? randomUUID(),
          ...query.data,
          like_count: query.data?.like_count ?? 0,
          is_hidden: query.data?.is_hidden ?? false,
          created_at: query.data?.created_at ?? new Date().toISOString(),
        };
        rows.push(row);
        return this.decorate(row, query, relations);
      },

      update: async (query: Query) => {
        const row = this.findFirst(rows, query.where);
        if (!row) throw new Error('Record not found');

        for (const [key, value] of Object.entries(query.data ?? {})) {
          row[key] =
            value && typeof value === 'object' && 'increment' in value
              ? row[key] + value.increment
              : value;
        }
        return this.decorate(row, query, relations);
      },

      // upsert: where 조건으로 찾아서 있으면 update, 없으면 create
      delete: async (query: Query) => {
        const row = this.findFirst(rows, query.where);
        const index = rows.findIndex((item) => item === row);
        if (index < 0) throw new Error('Record not found');

        rows.splice(index, 1);
        return this.decorate(row, query, relations);
      },

      upsert: async (query: {
        where?: Where;
        create?: Record<string, any>;
        update?: Record<string, any>;
        include?: Record<string, any>;
        select?: Record<string, boolean>;
      }) => {
        const existing = this.findFirst(rows, query.where);
        if (existing) {
          for (const [key, value] of Object.entries(query.update ?? {})) {
            existing[key] = value;
          }
          return this.decorate(existing, query, relations);
        } else {
          const row = {
            id: randomUUID(),
            ...query.create,
            created_at: new Date().toISOString(),
          };
          rows.push(row);
          return this.decorate(row, query, relations);
        }
      },
    };
  }

  private findFirst(rows: any[], where: Where = {}) {
    return this.filterRows(rows, where)[0] ?? null;
  }

  private filterRows(rows: any[], where: Where = {}) {
    return rows.filter((row) =>
      Object.entries(where).every(([key, value]) => {
        // 중첩 객체 (e.g. provider_social_id: { provider, social_id }) 처리
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return Object.entries(value as Record<string, unknown>).every(
            ([subKey, subVal]) => row[subKey] === subVal,
          );
        }
        return row[key] === value;
      }),
    );
  }

  private sortRows(
    rows: any[],
    orderBy?: Query['orderBy'],
  ) {
    if (!orderBy) return [...rows];

    // 배열 형태 (다중 정렬) 지원
    const orders = Array.isArray(orderBy) ? orderBy : [orderBy];

    return [...rows].sort((a, b) => {
      for (const order of orders) {
        const [[key, direction]] = Object.entries(order);
        if (a[key] === b[key]) continue;
        const result = a[key] > b[key] ? 1 : -1;
        return direction === 'desc' ? -result : result;
      }
      return 0;
    });
  }

  private decorate(
    row: any,
    query: Query = {},
    relations: Record<string, any[]> = {},
  ) {
    if (!row) return null;

    const decorated = { ...row };
    if (query.include?.user && relations.user) {
      decorated.user = this.applySelect(
        relations.user.find((user) => user.id === row.user_id),
        query.include.user.select,
      );
    }
    if (query.include?.admin && relations.admin) {
      decorated.admin = this.applySelect(
        relations.admin.find((user) => user.id === row.admin_id),
        query.include.admin.select,
      );
    }
    if (query.include?.wedding && relations.wedding) {
      decorated.wedding = this.applySelect(
        relations.wedding.find((wedding) => wedding.id === row.wedding_id),
        query.include.wedding.select,
      );
    }

    return query.select ? this.applySelect(decorated, query.select) : decorated;
  }

  private applySelect(row: any, select?: Record<string, boolean>) {
    if (!row || !select) return row ?? null;
    return Object.fromEntries(
      Object.entries(select)
        .filter(([, shouldInclude]) => shouldInclude)
        .map(([key]) => [key, row[key]]),
    );
  }
}
