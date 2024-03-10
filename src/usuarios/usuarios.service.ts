import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose';
import { hash, compare } from 'bcrypt'
import { HttpException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
//Propios
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';

@Injectable()
export class UsuariosService {
    constructor(
        @InjectModel(User.name)private userModel: Model<User>
    ){}

    //TODO Resgitro
    async createUser( user : CreateUserDto ){
        const { contrasena } = user;
        const plainToHash = await hash( contrasena, 10 );
        user = { ...user, contrasena:plainToHash };
        const createdUser = new this.userModel(user);
        createdUser.save();
    }

    async update ( id: string, user : UpdateUserDto ) {
        const { contrasena } = user;
        const plainToHash = await hash( contrasena, 10 );
        user = { ...user, contrasena:plainToHash };
        return this.userModel.findByIdAndUpdate( id, user, {
            new: true,
        }).exec();
    }

    async findAll(){
        return this.userModel.find().exec();
    }

    async findOne( id: string ){
        return this.userModel.findById(id).exec();
    }

    async delete ( id: string ){
        let user : UpdateUserDto = await this.userModel.findById(id).exec();
        user.activo = 0;
        return this.userModel.findByIdAndUpdate( id, user, {
            new: true,
        }).exec();
    }

    //TODO Login

    async login ( user : LoginUserDto ) {
        const { email, contrasena } = user;
        const finUser = await this.userModel.findOne({ email });
        if ( !finUser ) throw new HttpException('Usuario_no_encontrado', 404);

        const checkPass = await compare(contrasena, finUser.contrasena);
        if (!checkPass) throw new HttpException('Contraseña_incorrecta', 403);

        if (finUser.activo === 0) throw new HttpException('Usuario_no_disponible', 404);

        const token = jwt.sign({ id: finUser.id }, 'secretKey', { expiresIn: '1h' });
        // Retorna un objeto que incluye la data del usuario y el token
        return { userData: finUser, token };
    }

    
}
