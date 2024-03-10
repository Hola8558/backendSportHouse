import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

//Schemas
import { Client, ClientSchema } from './schemas/clientes.schema';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: Client.name,
            schema: ClientSchema
        }])
    ],
    providers: [ClientesService],
    controllers: [ClientesController]
})
export class ClientesModule {}
