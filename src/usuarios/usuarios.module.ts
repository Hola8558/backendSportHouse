import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

//Schemas
import { User, UserSchema } from './schemas/user.schema';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { AuthMiddleware } from 'src/auth-middleware.guard';
import { GymTasksSubscriber } from './gym-tasks.subscriber';
import { OptionsModule } from 'src/options/options.module';

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: User.name,
            schema: UserSchema
        }]),
        OptionsModule
    ],
    providers: [UsuariosService, GymTasksSubscriber],
    controllers: [UsuariosController]
})
export class UsuariosModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer
          .apply(AuthMiddleware)
          .exclude(
            { path: 'usuarios/:gynName/login', method: RequestMethod.POST },
            { path: 'usuarios/loginModeGood/Kriz', method: RequestMethod.POST }
          )
          .forRoutes(UsuariosController);
      }
}
