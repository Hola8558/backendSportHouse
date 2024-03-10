import { Controller, Post, Body, ValidationPipe, Put, Get, Delete, Param } from '@nestjs/common';

import { UsuariosService } from './usuarios.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';

@Controller('usuarios')
export class UsuariosController {
    constructor( 
        private userService: UsuariosService,
    ){}

    //TODO Resgitro

    @Post()
    async crearUsuario( @Body( new ValidationPipe() ) createdUser: CreateUserDto ){
        return this.userService.createUser(createdUser);
    }

    @Put(':id')
    async update ( @Param('id') id: string, @Body( new ValidationPipe() ) user: UpdateUserDto ) {
        return this.userService.update( id, user) 
    }

    @Get()
    async findAll(){
        return this.userService.findAll();
    }

    @Get(':id')
    async findOne( @Param('id') id: string ){
        return this.userService.findOne(id);
    }

    @Delete(':id')
    async delete ( @Param('id') id: string ){
        return this.userService.delete(id);
    }

    //TODO Login

    @Post('login')
    async login ( @Body( new ValidationPipe() ) loginUser : LoginUserDto ){
        return this.userService.login(loginUser);
    }
}

