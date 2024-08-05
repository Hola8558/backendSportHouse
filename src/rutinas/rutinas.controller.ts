import { Controller, Post, Body, ValidationPipe, Put, Get, Delete, Param, Req, Query } from '@nestjs/common';

/////////////////
import { rutinasService } from './rutinas.service';
import { EjercicioDto } from './dtos/ejercicios.dto';
import { EjercicioUpdateDto } from './dtos/ejercicios-update.dto';
import { rutinaUpdateDto } from './dtos/rutina.dto';

//import { Query as ExpressQuery } from 'express-serve-static-core'

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

    @Put(':gynName/ejercicio/:id')
    async updateEjercicio ( @Param('gynName')gynName : string, @Param('id') id: string, @Body( new ValidationPipe() ) ejercicio: EjercicioUpdateDto ) {
        return this.rutinasService.updateEjercicio(gynName, id, ejercicio) 
    }

    @Get(':gynName/ejercicios')
    async findAllEjercicios(@Param('gynName')gynName : string,){
        return this.rutinasService.findAllEjercicios(gynName);
    }

    @Get(':gynName/ejercicio/:id')
    async findOneEjercicio( @Param('gynName')gynName : string, @Param('id') id: string ){
        return this.rutinasService.findOneEjercicio(gynName, id);
    }

    /* Paginator */

    @Get(':gynName/ejerciciosPage')
    async getEjerciciosByValue( @Param('gynName')gynName : string, @Query() req: any ){//ExpressQuery
        return this.rutinasService.getEjerciciosByValue( gynName, req );
    }

    @Get(':gynName/ejerciciosPageStepper')
    async getEjerciciosByPage( @Param('gynName')gynName : string, ){
        return this.rutinasService.getEjerciciosByPage( gynName );
    }

    @Get(':gynName/getEjerciciosPaginados/:grupoM')
    async getEjerciciosPaginados( @Param('gynName')gynName : string, @Query() req: any, @Param('grupoM') grupoM : string ){ //ExpressQuery
        let page = 0
        if ( +req.page ) { page = +req.page; }
        return this.rutinasService.getEjerciciosPaginados( gynName, grupoM, page);
    }

    @Get('/gruposMusculares')
    async getgruposMusculares( ){
        return this.rutinasService.getgruposMusculares( );
    }

    /* Paginator */

    @Delete(':gynName/ejercicio/:id')
    async deleteEjercicios ( @Param('gynName')gynName : string, @Param('id') id: string ){
        return this.rutinasService.deleteEjercicio(gynName, id);
    }

    /** RUTINAS  */
    @Post(':gynName/createRutina')
    async crearRutina(  @Body() rutina: any, @Param('gynName')gynName : string ){
        return this.rutinasService.createRutina(rutina, gynName);
    }

    /* @Get('/verRutinas')
    async findAllRutinas(){
        return this.rutinasService.findAllRutinas();
    } */

    @Get(':gynName/getAllRutinasStarred')
    async getAllRutinasStarred(@Param('gynName')gynName : string){
        return this.rutinasService.getAllRutinasStarred(gynName);
    }

    @Get(':gynName/rutinasUna/:id')
    async findOneRutina( @Param('id') id: string, @Param('gynName')gynName : string ){        
        return this.rutinasService.findOneRutina(gynName, id);
    }

    @Delete(':gynName/deleteRutina/:id')
    async deleteRutina ( @Param('id') id: string, @Param('gynName')gynName : string ){        
        return this.rutinasService.deleteRutina(id, gynName);
    }

    @Put('/updateRutina/:id')
    async updateRutina (@Param('id') id: string, @Body( new ValidationPipe() ) rutina:  rutinaUpdateDto){
        return this.rutinasService.updateRutina(id, rutina);
    }

    @Put(':gynName/updateRutinaEjercicios/:id')
    async updateRutinaEjercicios (@Param('id') id: string, @Body( new ValidationPipe() ) rutina : any, @Param('gynName')gynName : string){
        return this.rutinasService.updateRutinaEjercicios(gynName, id, rutina);
    }

}