import { Module } from '@nestjs/common';
import { PayProccessController } from './payProccess.controller';
import { PayProccessService } from './payProccess.service';

@Module({
    imports:[],
    providers: [PayProccessService],
    controllers: [PayProccessController]
})
export class PayProccessModule { }
