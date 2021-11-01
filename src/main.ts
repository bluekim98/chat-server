import { NestFactory } from '@nestjs/core';
import { RedisIoAdapter } from './adapter/redis-io.adapter';
import { AppModule } from './app.module';
import { AppClusterService } from './cluster/app-cluster.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useWebSocketAdapter(new RedisIoAdapter(app));
    await app.listen(5000);
}
// bootstrap();
AppClusterService.clusterize(bootstrap);
