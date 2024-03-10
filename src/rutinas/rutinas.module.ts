import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

//Schemas
import { rutinasService } from './rutinas.service';
import { rutinasController } from './rutinas.controller';
import { Ejercicio, EjercicioSchema } from './schemas/ejercicios.schema';
import { Rutina, RutinaSchema } from './schemas/rutinas.schema';

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: Ejercicio.name,
            schema: EjercicioSchema
        },{
            name: Rutina.name,
            schema: RutinaSchema
        }
    ])
    ],
    providers: [rutinasService],
    controllers: [rutinasController]
})
export class RutinasModule {}
