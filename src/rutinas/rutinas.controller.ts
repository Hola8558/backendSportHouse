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

    /* Paginator */

    @Get('/ejerciciosPage')
    async getEjerciciosByValue(@Query() req: any ){//ExpressQuery
        return this.rutinasService.getEjerciciosByValue(req);
    }

    @Get('/ejerciciosPageStepper')
    async getEjerciciosByPage(){
        return this.rutinasService.getEjerciciosByPage();
    }

    @Get('/getEjerciciosPaginados/:grupoM')
    async getEjerciciosPaginados(@Query() req: any, @Param('grupoM') grupoM : string ){ //ExpressQuery
        let page = 0
        if ( +req.page ) { page = +req.page; }
        return this.rutinasService.getEjerciciosPaginados(grupoM, page);
    }

    @Get('/gruposMusculares')
    async getgruposMusculares( ){
        return this.rutinasService.getgruposMusculares( );
    }

    /* Paginator */

    @Delete('/ejercicio/:id')
    async deleteEjercicios ( @Param('id') id: string ){
        return this.rutinasService.deleteEjercicio(id);
    }

    /** RUTINAS  */
    @Post(':gynName/createRutina')
    async crearRutina(  @Body() rutina: any, @Param('gynName')gynName : string ){
        return this.rutinasService.createRutina(rutina, gynName);
    }

    @Get('/verRutinas')
    async findAllRutinas(){
        return this.rutinasService.findAllRutinas();
    }

    @Get('/getAllRutinasStarred')
    async getAllRutinasStarred(){
        return this.rutinasService.getAllRutinasStarred();
    }

    @Get('/rutinasUna/:id')
    async findOneRutina( @Param('id') id: string ){        
        return this.rutinasService.findOneRutina(id);
    }

    @Delete(':gynName/deleteRutina/:id')
    async deleteRutina ( @Param('id') id: string, @Param('gynName')gynName : string ){        
        return this.rutinasService.deleteRutina(id, gynName);
    }

    @Put('/updateRutina/:id')
    async updateRutina (@Param('id') id: string, @Body( new ValidationPipe() ) rutina:  rutinaUpdateDto){
        return this.rutinasService.updateRutina(id, rutina);
    }

    @Put('/updateRutinaEjercicios/:id')
    async updateRutinaEjercicios (@Param('id') id: string, @Body( new ValidationPipe() ) rutina : any){
        return this.rutinasService.updateRutinaEjercicios(id, rutina);
    }

}