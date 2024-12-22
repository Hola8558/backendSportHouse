import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

//Schemas
import { rutinasService } from './rutinas.service';
import { rutinasController } from './rutinas.controller';
import { Ejercicio, EjercicioSchema } from './schemas/ejercicios.schema';
import { Rutina, RutinaSchema } from './schemas/rutinas.schema';
import { AuthMiddleware } from 'src/auth-middleware.guard';

/* {
    name: Rutina.name,
    schema: RutinaSchema
} */
@Module({
    imports:[
        MongooseModule.forFeature([{
            name: Ejercicio.name,
            schema: EjercicioSchema
        },
    ])
    ],
    providers: [rutinasService],
    controllers: [rutinasController]
})
export class RutinasModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer
          .apply(AuthMiddleware)
          .forRoutes(rutinasController);
      }
    /* configure(consumer : MiddlewareConsumer) {
        console.log('Configuring Middleware for Rutinas...');
        consumer
        .apply(AuthMiddleware)
        .forRoutes(
          { path: 'rutinas', method: RequestMethod.ALL }
        );
        console.log('Middleware configured for /rutinas');
      } */
}
