import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Client } from "./schemas/clientes.schema";
import { Model } from "mongoose";
import { CreateClientDto } from "./dtos/create-client.dto";
import { UpdateClientDto } from "./dtos/update-client.dto";
import { ImagesDto } from "./dtos/image-profile.dto";
import * as jwt from 'jsonwebtoken';
import { hash, compare } from 'bcrypt';
import { LoginUserDto } from "./dtos/login-user.dto";

@Injectable()
export class ClientesService {
    constructor(
        @InjectModel(Client.name) private clientModel: Model<Client>
    ){}

    async createClient ( client : CreateClientDto ){
        const { pass } = client;
        const plainToHash = await hash( pass, 10 );
        client = { ...client, pass:plainToHash };
        const createdClient = new this.clientModel(client);
        createdClient.save();
    }

    async uploadProfileImage( id : string, filename : ImagesDto ){
        try {
            const updatedClient = await this.clientModel.findOneAndUpdate(
              { _id: id },
              { profileImg: filename },
              { new: true }, // Devuelve el documento actualizado
            );
      
            return updatedClient;
        } catch (error) {
            console.error('Error al actualizar la imagen del perfil:', error.message);
            throw new HttpException("Error al actualizar imagen de perfil",401);
            return null;
        }
    }

    async updateClient ( id : string, client : UpdateClientDto ){
        const { pass } = client;
        if (pass){
            const plainToHash = await hash( pass, 10 );
            client = { ...client, pass:plainToHash };
        }
        return this.clientModel.findByIdAndUpdate( id, client, {
            new: true,
        }).exec();
    }

    async findAllClients(){
        let r = this.clientModel.find().exec();
        return r;
    }

    async findOneClient( id: string ){
        let r = this.clientModel.findById(id).exec();
        return this.clientModel.findById(id).exec();
    }

    async findOneClientByCuenta( ncuenta: string ){
        return this.clientModel.findOne({ ncuenta }).exec();
    }

    async deleteClient ( id : string ){
        return this.clientModel.findByIdAndDelete(id).exec();
    }

    async setRutina( id:string, d:string, rutina:any ){
        let e = await this.clientModel.findById(id).exec();
        let rutinas : {l:string,M:string,Mi:string,J:string,V:string,S:string} = {l:'',M:'',Mi:'',J:'',V:'',S:''}
        if (e.rutinas){
            //rutinas = e.rutinas as { l: string; M: string; Mi: string; J: string; V: string; S: string } || { l: "", M: "", Mi: "", J: "", V: "", S: "" };
            rutinas = { ...rutinas, ...e.rutinas };
        }        
        if (d === 'Lunes'){ rutinas.l = rutina.rutina }
        if (d === 'Martes'){ rutinas.M = rutina.rutina }
        if (d === 'Miercoles'){ rutinas.Mi = rutina.rutina }
        if (d === 'Jueves'){ rutinas.J = rutina.rutina }
        if (d === 'Viernes'){ rutinas.V = rutina.rutina }
        if (d === 'Sabado'){ rutinas.S = rutina.rutina }
        if (e){
            e.set({ rutinas: rutinas });
            // Guarda los cambios en la base de datos
            return await e.save();
        }
    }

    async findRutina(id:string, d:string){
       // let e = await this.clientModel.findById(id).exec();
       // let rutinas : {l:string,M:string,Mi:string,J:string,V:string,S:string} = {l:'',M:'',Mi:'',J:'',V:'',S:''};
       // if (e.rutinas){
       //     //rutinas = e.rutinas as { l: string; M: string; Mi: string; J: string; V: string; S: string } || { l: "", M: "", Mi: "", J: "", V: "", S: "" };
       //     rutinas = { ...rutinas, ...e.rutinas };
       // }
       // if (d === 'Lunes'){ return rutinas.l }
       // if (d === 'Martes'){ return rutinas.M }
       // if (d === 'Miercoles'){ return rutinas.Mi }
       // if (d === 'Jueves'){ return rutinas.J }
       // if (d === 'Viernes'){ return rutinas.V }
       // if (d === 'Sabado'){ return rutinas.S }
    }

    async loginSocio ( socio : LoginUserDto ) {
        const { email, contrasena } = socio;
        const finUser = await this.clientModel.findOne({ncuenta: email});
        if ( !finUser ) throw new HttpException('Socio_no_encontrado', 404);

        if (this.fechaYaPaso(finUser.fechaVencimiento) === true) throw new HttpException('Usuario_vencido', 403);
        const checkPass = await compare(contrasena, finUser.pass);
        if (!checkPass) throw new HttpException('Contraseña_incorrecta', 403);
//
        const token = jwt.sign({ id: finUser.id }, 'secretKey', { expiresIn: '1h' });
        //// Retorna un objeto que incluye la data del usuario y el token
        return { userData: finUser, token };
    }

    fechaYaPaso(fechaString:string) {
        // Obtener la fecha actual
        const fechaActual = new Date();
      
        // Convertir la cadena de fecha dada a un objeto Date
        const fechaDada = new Date(fechaString);
      
        // Comparar las fechas
        return fechaDada < fechaActual;
      }
}