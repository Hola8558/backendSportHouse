import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model, Schema } from 'mongoose';
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
        @InjectModel(User.name)private userModel: Model<User>,
        @InjectConnection() private readonly connection: Connection
    ){}

     /* GENERA MODELO DINÁMICO */
     async generateDynamicalModel(gynName: string, subCollection: string): Promise<Model<Document>> {
        let dynamicModel: Model<Document>;
        try {
            this.connection.deleteModel(gynName);
        } catch (error) {
            if (error.name !== 'MissingSchemaError') {
                throw error;
            }
        }
        const subSchema = new Schema({}, { strict: false });
        const mainSchema = new Schema({
            [subCollection]: [subSchema]
        }, { strict: false });
        dynamicModel = this.connection.model<Document>(gynName, mainSchema);
        return dynamicModel;
    }

    async createModels(gynName: string, collections: string[]) {        
        for (let subC of collections) {
            const dynamicModel = await this.generateDynamicalModel(gynName, subC);
            const existingDocument = await dynamicModel.findOne({ [subC]: { $exists: true } });
    
            if (!existingDocument) {
                const newDocument = new dynamicModel({ [subC]: [] });
                await newDocument.save();
            }
        }
    }

    //TODO Resgitro
    async createUser( user : CreateUserDto, gynName : string ){
        const { contrasena } = user;
        const plainToHash = await hash( contrasena, 10 );
        user = { ...user, contrasena:plainToHash };
        /* const createdUser = new this.userModel(user);
        createdUser.save(); */
        const dynamicModel = await this.generateDynamicalModel(gynName, "usuarios");
        const existingDocument = await dynamicModel.findOne({ ["usuarios"]: { $exists: true } });

        if (existingDocument) {
            existingDocument["usuarios"].push(user);
            await existingDocument.save();
        } else {
            const createdUser = new dynamicModel({ ["usuarios"]: [user] });
            await createdUser.save();
        }
    }

    async update ( id: string, user : UpdateUserDto, gynName : string ) {
        const dynamicModel = await this.generateDynamicalModel(gynName, "usuarios");
        const { contrasena } = user;
        const plainToHash = await hash( contrasena, 10 );
        user = { ...user, contrasena:plainToHash };
        const updateFields = {};
        Object.keys(user).forEach(key => {
            updateFields[`usuarios.$.${key}`] = user[key];
        });
        const result = await dynamicModel.updateOne(
            { "usuarios._id": id },
            { $set: updateFields }
        );
        if (!result) {
            console.error("Usuario not found or no changes made");
            return new Error("Usuario not found or no changes made");
        }

        // Volver a cargar el documento actualizado
        const updatedDocument = await dynamicModel.findOne({ "usuarios._id": id });
        const updatedClient = updatedDocument["usuarios"].find(user => user._id.toString() === id);

        return { message: "Usuario updated successfully", user: updatedClient };
    }

    async findAll(gynName : string){
        const dynamicModel = await this.generateDynamicalModel(gynName, "usuarios");
        const existingDocument = await dynamicModel.findOne({ ["usuarios"]: { $exists: true } });        
        return existingDocument["usuarios"];
    }

    async findOne( id: string, gynName : string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "usuarios");
        const existingDocument = await dynamicModel.findOne({ ["usuarios"]: { $exists: true } });        
        const users = existingDocument["usuarios"]
        if (users) {
            let e = false
            let u 
            users.forEach(element => {                
                if (element._id.toString() === id){
                    e = true;
                    u = element;
                }
            });
            if (e){
                return u
            } else {
                return new Error("Usuario no encontrado");
            }
        } else {
            return new Error("Usuario no encontrado");
        }
    }

    async delete ( id: string, gynName : string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "usuarios");
        const existingDocument = await dynamicModel.findOne({ ["usuarios"]: { $exists: true } });        
        if (existingDocument) {
            // Actualiza el documento eliminando el cliente con el ID especificado
            await dynamicModel.updateOne(
                { ["usuarios._id"]: id },  // Condición para encontrar el cliente
                { $pull: { usuarios: { _id: id } } }  // Operación para eliminar el cliente
            );
            
            return { message: "Usuario deleted successfully" };
        } else {
            throw new Error("Usurio no encontrado");
        }
    }

    //TODO Login

    async login ( user : LoginUserDto, gynName: string ) {
        const { email, contrasena } = user;
        /* const finUser = await this.userModel.findOne({ email }); */

        const dynamicModel = await this.generateDynamicalModel(gynName, "usuarios");
        const existingDocument = await dynamicModel.findOne({ ["usuarios"]: { $exists: true } });        
        const users = existingDocument["usuarios"];
        if (users) {
            let e = false
            let finUser 
            users.forEach(element => {                
                if (element.email.toString() === email){
                    e = true;
                    finUser = element;
                }
            });
            if (e){
                const checkPass = await compare(contrasena, finUser.contrasena);
                if (!checkPass) return new HttpException('Contraseña_incorrecta', 403);

                if (finUser.activo === 0) return new HttpException('Usuario_no_disponible', 404);

                const token = jwt.sign({ id: finUser.id }, 'secretKey', { expiresIn: '1h' });
                // Retorna un objeto que incluye la data del usuario y el token
                return { userData: finUser, token };
            } else {
                return new HttpException('Usuario_no_encontrado', 404);
            }
        } else return new HttpException('Usuario_no_encontrado', 404);
    }

    async loginModeGood ( user : LoginUserDto ) {
        const { email, contrasena } = user;
        const finUser = await this.userModel.findOne({ email });
        if ( !finUser ) return new HttpException('Usuario_no_encontrado', 404);

        const checkPass = await compare(contrasena, finUser.contrasena);
        if (!checkPass) return new HttpException('Contraseña_incorrecta', 403);

        if (finUser.activo === 0) return new HttpException('Usuario_no_disponible', 404);
        if (finUser.admin === 0) return new HttpException('Usuario_no_es_Totopo', 403);

        const token = jwt.sign({ id: finUser.id }, 'secretKey', { expiresIn: '1h' });
        // Retorna un objeto que incluye la data del usuario y el token
        return { userData: finUser, token };
    }

    async createUserModeGood( user : CreateUserDto ){
        const { contrasena } = user;
        const plainToHash = await hash( contrasena, 10 );
        user = { ...user, contrasena:plainToHash };
        const createdUser = new this.userModel(user);
        createdUser.save();
    }

    async checkPass(nombre: string, apellidos: string, pass: any, gynName : string){
        const dynamicModel = await this.generateDynamicalModel(gynName, "usuarios");
        const existingDocument = await dynamicModel.findOne({ ["usuarios"]: { $exists: true } });        
        const users = existingDocument["usuarios"]
        if (users) {
            let e = false
            let u 
            users.forEach(element => {                
                if (element.nombre.toString() === nombre && element.apellidos.toString() === apellidos ){
                    e = true;
                    u = element;
                }
            });
            if (e){
                const checkPass = await compare(pass.pass, u.contrasena);
                if (!checkPass) throw new HttpException('Contraseña_incorrecta', 403);
                return true;
            } else {
                return new HttpException('Usuario_no_encontrado', 404);
            }
        } else {
            return new HttpException('Usuario_no_encontrado', 404);
        }
/* 
        const foundUser = await this.userModel.findOne({ nombre, apellidos });
        if (!foundUser) {
            throw new HttpException('Socio_no_encontrado', 404);
        }
        const checkPass = await compare(pass.pass, foundUser.contrasena);
        if (!checkPass) throw new HttpException('Contraseña_incorrecta', 403);

        return true; */
    }

    

    
}
