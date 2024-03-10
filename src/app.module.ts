import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ClientesModule } from './clientes/clientes.module';
import { RutinasModule } from './rutinas/rutinas.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://cristopher29092005:0xsWYRsCq9D8c8Ed@cluster0.axtmvr7.mongodb.net/mc-fitness-gym?retryWrites=true&w=majority'),
    UsuariosModule,
    ClientesModule,
    RutinasModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
