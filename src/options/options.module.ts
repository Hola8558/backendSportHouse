import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

//Schemas
//import { Options, OptionsSchema } from './schemas/options.schema';
import { OptionsService } from './options.service';
import { OptionsController } from './options.controller';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
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
export class OptionsModule {}
