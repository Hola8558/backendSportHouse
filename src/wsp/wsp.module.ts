import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { WspController } from './wsp.controller';
import { AuthMiddleware } from 'src/auth-middleware.guard';

@Module({
    imports:[ ],
    providers: [],
    controllers: [WspController]
})
export class WspModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer
          .apply(AuthMiddleware)
          .forRoutes(WspController);
      }
}
