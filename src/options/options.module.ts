import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

//Schemas
//import { Options, OptionsSchema } from './schemas/options.schema';
import { OptionsService } from './options.service';
import { OptionsController } from './options.controller';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { AuthMiddleware } from 'src/auth-middleware.guard';
/*   MongooseModule.forFeature([{
            name: Options.name,
            schema: OptionsSchema
        }
    ]) */
@Module({
    imports:[
    MulterModule.register({
        storage: multer.memoryStorage(), // Store files in memory
      }),
    ],
    providers: [OptionsService],
    controllers: [OptionsController]
})
export class OptionsModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer
          .apply(AuthMiddleware)
          .forRoutes(OptionsController);
      }
}
