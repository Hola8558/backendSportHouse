import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

//Schemas
import { Client, ClientSchema } from './schemas/clientes.schema';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { AuthMiddleware } from 'src/auth-middleware.guard';
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
export class ClientesModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer
          .apply(AuthMiddleware)
          .exclude(
            { path: 'clientes/:gynName/loginSocio', method: RequestMethod.POST },
            )
          .forRoutes(ClientesController);
      }
}
