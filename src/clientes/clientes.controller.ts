import { Controller, Post, Body, ValidationPipe, Put, Get, Delete, Param, UseInterceptors, UploadedFile, Res, HttpStatus, Query } from '@nestjs/common';

/////////////////
import { ClientesService } from "./clientes.service";
import { CreateClientDto } from './dtos/create-client.dto';
import { UpdateClientDto, rutinasDTO } from './dtos/update-client.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, renameImage } from './images.helper';
import { LoginUserDto } from './dtos/login-user.dto';

import { Query as ExpressQuery } from 'express-serve-static-core'
import { FilterQuery } from 'mongoose';

@Controller('clientes')
export class ClientesController {
    constructor( 
        private clientesService: ClientesService,
    ){}

    @Post('loginSocio')
    async loginSocio ( @Body( new ValidationPipe() ) loginUser : LoginUserDto ){
        return this.clientesService.loginSocio(loginUser);
    }

    @Get('verificationLoginSocio/:id')
    async verificationVencimientoSocio ( @Param('id') id : string ){
        return this.clientesService.verificationVencimientoSocio(id);
    }

    @Post()
    async crearCliente( @Body( new ValidationPipe() ) createdClient: CreateClientDto ){
        return this.clientesService.createClient(createdClient);
    }

    @Post(':id/imgProfile')
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
    }

    @Put(':id')
    async update ( @Param('id') id: string, @Body( new ValidationPipe() ) client: UpdateClientDto ) {
        return this.clientesService.updateClient( id, client) 
    }

    @Put(':id/addRutina/:day')
    async setRutina ( @Param('id') id: string, @Param('day') day : string , @Body() rutina: any ) {
        return this.clientesService.setRutina( id, day , rutina);
    }

    @Get('pages/:page')
    async findAll( @Query() req: ExpressQuery ){
        console.log('ci');
        
        let page = 0;
        if ( +req.page ) { page = +req.page; };
        return this.clientesService.findAllClients(page, req );
    }

    @Get('getTotalPages')
    async getTotalPages( @Query() req: ExpressQuery ){
        const filter: FilterQuery<any> = {
            $or: [
                { ncuenta: { $regex: req.filer, $options: 'i' } },
                { nombre: { $regex: req.filer, $options: 'i' } },
                { apellidos: { $regex: req.filer, $options: 'i' } }
            ]
        };
        return this.clientesService.getTotalPages(filter);
    }

    @Get('byId/:id')
    async findOne( @Param('id') id: string ){
        return this.clientesService.findOneClient(id);
    }

    @Get('cuenta/:id')
    async findOneByCuenta( @Param('id') id: string ){
        return this.clientesService.findOneClientByCuenta(id);
    }

    @Delete(':id')
    async delete ( @Param('id') id: string ){
        return this.clientesService.deleteClient(id);
    }
}