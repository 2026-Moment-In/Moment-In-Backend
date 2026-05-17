import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
  });
  await app.listen(process.env.PORT ?? 3000, "0.0.0.0"); 
  console.log(`http://localhost:${process.env.PORT ?? 3000} 서버 실행 중...`);
}

bootstrap();