# MomentIn Backend

NestJS + Prisma backend for the MomentIn wedding event app.

## Teammate Setup

If you cloned this repository from GitHub, do this first.

1. Install dependencies.

```bash
npm install
```

2. Create `Moment-In-Backend/.env`.

Ask a teammate for the real `.env` file, or copy `.env.example`:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Default local development values:

```env
PORT=3000
DATABASE_URL="file:./prisma/dev.db"

JWT_SECRET=change-me

KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_CALLBACK_URL=http://localhost:3000/auth/kakao/callback

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

AWS_REGION=ap-northeast-2
AWS_S3_BUCKET_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

3. Prepare Prisma.

```bash
npx prisma generate
```

If `prisma/dev.db` is not included and the app needs a fresh local DB, run:

```bash
npx prisma db push
```

4. Start the backend.

```bash
npm run start:dev
```

The backend should run at:

```text
http://localhost:3000
```

## Keeping the Same Local Data

If you need the exact same weddings/photos/guestbooks as another teammate's local machine, you also need these local runtime files:

```text
prisma/dev.db
public/uploads/
```

Without those files, the app will still run, but local data and locally uploaded photos will be different.

## Scripts

```bash
npm run start:dev  # local dev server
npm run build      # production build
npm run start:prod # run built app
```

## Notes

- Do not commit `.env`.
- `.env.example` should stay committed because it documents required environment variables.
- If AWS keys are empty, uploaded images are saved locally under `public/uploads`.
- `GET /auth/dev` exists for local development when Kakao/Google login is unavailable.
