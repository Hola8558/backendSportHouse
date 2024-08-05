import { Controller, Post, Body, ValidationPipe, Put, Get, Delete, Param, UseInterceptors, UploadedFile, Res, HttpStatus, Query } from '@nestjs/common';

/////////////////
import { ClientesService } from "./clientes.service";
import { CreateClientDto } from './dtos/create-client.dto';
import { UpdateClientDto, rutinasDTO } from './dtos/update-client.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, renameImage } from './images.helper';
import { LoginUserDto } from './dtos/login-user.dto';

//import { Query as ExpressQuery } from 'express'
import { FilterQuery } from 'mongoose';

@Controller('clientes')
export class ClientesController {
    constructor( 
        private clientesService: ClientesService,
    ){}

    /* LOGIN */
    @Post(':gynName/loginSocio')
    async loginSocio ( @Param('gynName') gynName : string, @Body( new ValidationPipe() ) loginUser : LoginUserDto ){
        return this.clientesService.loginSocio( gynName, loginUser );
    }

    @Get('verificationLoginSocio/:id')
    async verificationVencimientoSocio ( @Param('id') id : string ){
        //return this.clientesService.verificationVencimientoSocio(id);
    }

    /* CLIENTS */

    @Post(":gynName")
    async crearCliente( @Param('gynName') gynName : string, @Body( new ValidationPipe() ) createdClient: CreateClientDto ){
        return this.clientesService.createClient(createdClient, gynName);
    }

    /* @Post(':id/imgProfile')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './upload',
            filename: renameImage
        }),
        fileFilter: fileFilter
    }))
    async uploadProfilePhoto( @Res() res, @Param('id') id: string, @UploadedFile() file: Express.Multer.File ){
        return res.status(HttpStatus.OK).json({
            success: true,
            data: file.path
        })//await this.clientesService.uploadProfileImage(id, {filename: file.filename})
    } */

    @Put(':gynName/:id')
    async update ( @Param('id') id: string, @Param('gynName') gynName: string, @Body( new ValidationPipe() ) client: UpdateClientDto ) {
        return this.clientesService.updateClient( id, client, gynName) 
    }

    @Get(':gynName/pages/:page')
    async findAll( @Query() req: any, @Param('gynName') gynName: string ){ //ExpressQuery
        let page = 0; 
        if ( +req.page ) { page = +req.page; };
        const filter = {
            ncuenta:   req.filer,
            nombre:    req.filer,
            apellidos: req.filer
        };   
        return this.clientesService.findAllClients(page, filter, gynName );
    }

    @Get(':gynName/getTotalPages')
    async getTotalPages( @Query() req: any, @Param('gynName') gynName: string ){ //ExpressQuery
        const filter = {
            ncuenta:   req.filer,
            nombre:    req.filer,
            apellidos: req.filer
        };        
        return this.clientesService.getTotalPages(filter, gynName);
    }

    @Get(':gynName/byId/:id')
    async findOne( @Param('id') id: string, @Param('gynName') gynName: string ){
        return this.clientesService.findOneClient(id, gynName);
    }

    @Get(':gynName/cuenta/:id')
    async findOneByCuenta( @Param('id') id: string, @Param('gynName') gynName: string ){
        return this.clientesService.findOneClientByCuenta(id, gynName);
    }

    @Delete(':gynName/:id')
    async delete ( @Param('id') id: string, @Param('gynName') gynName: string ){
        return this.clientesService.deleteClient(id, gynName);
    }

    /* RUTINAS */

    @Put(':gynName/:id/addRutina/:day')
    async setRutina ( @Param('id') id: string, @Param('gynName') gynName: string, @Param('day') day : string , @Body() rutina: any ) {
        return this.clientesService.setRutina( id, day , rutina, gynName);
    }

}