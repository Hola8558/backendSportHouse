import { Controller, Post, Body, ValidationPipe, Put, Get, Delete, Param } from '@nestjs/common';

/////////////////
import { rutinasService } from './rutinas.service';
import { EjercicioDto } from './dtos/ejercicios.dto';
import { EjercicioUpdateDto } from './dtos/ejercicios-update.dto';
import { RutinaDto } from './dtos/rutina.dto';

@Controller('rutinas')
export class rutinasController {

    constructor( 
        private rutinasService: rutinasService,
    ){}


    /* EJERCICIOS */
    @Post('/createEjercico')
    async crearEjercicio( @Body( new ValidationPipe() ) ejercicio: EjercicioDto ){
        return this.rutinasService.createEjercicio(ejercicio);
    }

    @Put('/ejercicio/:id')
    async updateEjercicio ( @Param('id') id: string, @Body( new ValidationPipe() ) ejercicio: EjercicioUpdateDto ) {
        return this.rutinasService.updateEjercicio( id, ejercicio) 
    }

    @Get('/ejercicios')
    async findAllEjercicios(){
        return this.rutinasService.findAllEjercicios();
    }

    @Get('/ejercicio/:id')
    async findOneEjercicio( @Param('id') id: string ){
        return this.rutinasService.findOneEjercicio(id);
    }

    @Delete('/ejercicio/:id')
    async deleteEjercicios ( @Param('id') id: string ){
        return this.rutinasService.deleteEjercicio(id);
    }

    /** RUTINAS  */
    @Post('/createRutina')
    async crearRutina(  @Body(new ValidationPipe()) rutina: RutinaDto ){
        console.log(rutina)
        return this.rutinasService.createRutina(rutina);
    }

    @Get('/verRutinas')
    async findAllRutinas(){
        return this.rutinasService.findAllRutinas();
    }

    @Get('/rutinasUna/:id')
    async findOneRutina( @Param('id') id: string ){
        return this.rutinasService.findOneRutina(id);
    }

}