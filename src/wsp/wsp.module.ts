import { Module } from '@nestjs/common';
import { WspController } from './wsp.controller';

@Module({
    imports:[ ],
    providers: [],
    controllers: [WspController]
})
export class WspModule {}
