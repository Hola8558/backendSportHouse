import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { env } from 'process';
import config  from './config';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ClientesModule } from './clientes/clientes.module';
import { RutinasModule } from './rutinas/rutinas.module';
import { enviroments } from './enviroments';
import { OptionsModule } from './options/options.module';
import { WspModule } from './wsp/wsp.module';
import { PayProccessModule } from './payments/payProccess.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:enviroments[process.env.NODE_ENV] || '.env',
      load:[config],
      isGlobal:true,
      validationSchema:Joi.object({
        USER: Joi.string().required(),
        PASS: Joi.string().required(),
        CONECTION: Joi.string().required()
      })
    }),
    MongooseModule.forRoot(`mongodb+srv://${env.USER}:${env.PASS}@cluster0.axtmvr7.mongodb.net/${env.CONECTION}`),
    UsuariosModule,
    ClientesModule,
    RutinasModule,
    OptionsModule,
    PayProccessModule,
    WspModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  
  /* configure(consumer : MiddlewareConsumer) {
    console.log('Configuring Middleware...');
    consumer
    .apply(AuthMiddleware)
    .forRoutes(
      { path: 'rutinas', method: RequestMethod.ALL }
    );
    console.log('Middleware configured for /rutinas');
  } */
}
