import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

//Schemas
import { Options, OptionsSchema } from './schemas/options.schema';
import { OptionsService } from './options.service';
import { OptionsController } from './options.controller';

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: Options.name,
            schema: OptionsSchema
        }
    ])
    ],
    providers: [OptionsService],
    controllers: [OptionsController]
})
export class OptionsModule {}
