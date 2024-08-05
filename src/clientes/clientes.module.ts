import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

//Schemas
import { Client, ClientSchema } from './schemas/clientes.schema';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
/* MongooseModule.forFeature([{
    name: Client.name,
    schema: ClientSchema
}]) */
@Module({
    imports:[
        
    ],
    providers: [ClientesService],
    controllers: [ClientesController]
})
export class ClientesModule {}
