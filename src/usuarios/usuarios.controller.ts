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

    @Post(':gynName')
    async crearUsuario( @Body( new ValidationPipe() ) createdUser: CreateUserDto, @Param("gynName") gynName : string ){
        return this.userService.createUser(createdUser, gynName);
    }

    @Put(':gynName/:id')
    async update ( @Param('id') id: string, @Param('gynName') gynName: string, @Body( new ValidationPipe() ) user: UpdateUserDto ) {
        return this.userService.update( id, user, gynName) 
    }

    @Get(':gynName')
    async findAll(@Param("gynName") gynName : string){
        return this.userService.findAll(gynName);
    }

    @Get(':gynName/:id')
    async findOne( @Param('id') id: string, @Param('gynName') gynName: string, ){
        return this.userService.findOne(id, gynName);
    }

    @Delete(':gynName/:id')
    async delete ( @Param('id') id: string, @Param('gynName') gynName: string, ){
        return this.userService.delete(id, gynName);
    }

    //TODO Login

    @Post(':gynName/login')
    async login ( @Body( new ValidationPipe() ) loginUser : LoginUserDto, @Param('gynName')gynName: string ){
        return this.userService.login(loginUser, gynName);
    }

    @Post('loginModeGood/Kriz')
    async loginModeGood ( @Body( new ValidationPipe() ) loginUser : LoginUserDto ){
        return this.userService.loginModeGood( loginUser );
    }

    @Post('createUser/Kriz')
    async createUserModeGood ( @Body( new ValidationPipe() ) admin : CreateUserDto ){
        return this.userService.createUserModeGood( admin );
    }

    @Post(':gynName/generateModels')
    async createModels(@Body( new ValidationPipe() ) collections : any, @Param('gynName')gynName: string){
        return await this.userService.createModels(gynName, collections.collections)
    }

    @Post(':gynName/checkPass/:user')
    async checkPass(@Param('user') user : string , @Body() pass : string, @Param('gynName')gynName : string ){
        const userParts = decodeURIComponent(user).split(' ');
        const nombre = userParts.slice(0, -1).join(' ');
        const apellidos = userParts.slice(-1).join(' ');
        return this.userService.checkPass(nombre.toString(), apellidos.toString(), pass, gynName);
    }
    
}

