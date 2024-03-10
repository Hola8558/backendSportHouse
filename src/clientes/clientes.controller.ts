import { Controller, Post, Body, ValidationPipe, Put, Get, Delete, Param, UseInterceptors, UploadedFile, Res, HttpStatus } from '@nestjs/common';

/////////////////
import { ClientesService } from "./clientes.service";
import { CreateClientDto } from './dtos/create-client.dto';
import { UpdateClientDto, rutinasDTO } from './dtos/update-client.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, renameImage } from './images.helper';

@Controller('clientes')
export class ClientesController {
    constructor( 
        private clientesService: ClientesService,
    ){}

    @Post('loginSocio')
    async loginSocio ( @Body( new ValidationPipe() ) loginUser : { email : string } ){
        return this.clientesService.loginSocio(loginUser.email);
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
    async setRutina ( @Param('id') id: string, @Param('day') day : string , @Body(new ValidationPipe()) rutina: rutinasDTO ) {
        console.log(rutina)
        return this.clientesService.setRutina( id, day , rutina);
    }

    @Get()
    async findAll(){
        return this.clientesService.findAllClients();
    }

    @Get(':id')
    async findOne( @Param('id') id: string ){
        return this.clientesService.findOneClient(id);
    }

    @Delete(':id')
    async delete ( @Param('id') id: string ){
        return this.clientesService.deleteClient(id);
    }
}