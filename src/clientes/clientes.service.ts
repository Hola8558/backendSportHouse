import { HttpException, Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Client } from './schemas/clientes.schema';
import { Connection, FilterQuery, Model, Schema } from "mongoose";
//import { Query } from 'express'
import { CreateClientDto } from "./dtos/create-client.dto";
import { UpdateClientDto } from "./dtos/update-client.dto";
import { ObjectId } from "mongodb";
import * as jwt from 'jsonwebtoken';
import { hash, compare } from 'bcrypt';
import { LoginUserDto } from "./dtos/login-user.dto";

@Injectable()
export class ClientesService {
    constructor(
        //@InjectModel(Client.name) private clientModel: Model<Client>,
        @InjectConnection() private readonly connection: Connection
    ){}

    private pageNumberClients = 15;

    /* LOGIN */
    async loginSocio ( gynName:string, socio : LoginUserDto ) {
        const { email, contrasena } = socio;
        const dynamicModel = await this.generateDynamicalModel(gynName, "clients");
        const existingDocument = await dynamicModel.findOne({ ["clients"]: { $exists: true } });
        const clients = existingDocument["clients"]
        if (clients){
            const finUser = clients.find(c => c.ncuenta === email);
            if ( !finUser ) throw new HttpException('Socio_no_encontrado', 404);
            if (this.fechaYaPaso(finUser.fechaVencimiento) === true) return new HttpException('Usuario_vencido', 403);
            const checkPass = await compare(contrasena, finUser.pass);
            if (!checkPass) return new HttpException('Contraseña_incorrecta', 403);            
            const token = jwt.sign({ id: gynName }, 'secretKey', { expiresIn: '4h' }); //TODO: Realmente debe ser así?
            //// Retorna un objeto que incluye la data del usuario y el token
            return { userData: finUser, token };
        }else {
            return new HttpException('Socio no encotrado', 404);
        }       
    }

   /*  async verificationVencimientoSocio( id : string ){
        const finUser = await this.clientModel.findOne({_id: id});
        if ( !finUser ) throw new HttpException('Socio_no_encontrado', 404);

        if (this.fechaYaPaso(finUser.fechaVencimiento) === true) throw new HttpException('Usuario_vencido', 403);
        const token = jwt.sign({ id: finUser.id }, 'secretKey', { expiresIn: '1h' });
        //// Retorna un objeto que incluye la data del usuario y el token
        return { userData: finUser, token };
    } */

    fechaYaPaso(fechaString:string) {
        const fechaActual = new Date();
        const fechaDada = new Date(fechaString);
        return fechaDada < fechaActual;
    } 

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

    /* CLIENTES */
    async createClient ( client : CreateClientDto, gynName : string ){
        const { pass } = client;
        const plainToHash = await hash( pass, 10 );
        client = { ...client, pass:plainToHash };
        const dynamicModel = await this.generateDynamicalModel(gynName, "clients");
        const existingDocument = await dynamicModel.findOne({ ["clients"]: { $exists: true } });
        if (existingDocument) {
            existingDocument["clients"].push(client);
            await existingDocument.save();
        } else {
            const createdClient = new dynamicModel({ ["clients"]: [client] });
            await createdClient.save();
        }
    }

    async updateClient ( id : string, client : UpdateClientDto, gynName : string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "clients");
        const { pass } = client;
        if (pass){
            const plainToHash = await hash( pass, 10 );
            client = { ...client, pass:plainToHash };
        }
        // Construir el objeto de actualización
        const updateFields = {};
        Object.keys(client).forEach(key => {
            updateFields[`clients.$.${key}`] = client[key];
        });
        // Actualizar el subdocumento directamente en la base de datos
        const result = await dynamicModel.updateOne(
            { "clients._id": id },
            { $set: updateFields }
        );

        if (!result) {
            throw new Error("Client not found or no changes made");
        }

        // Volver a cargar el documento actualizado
        const updatedDocument = await dynamicModel.findOne({ "clients._id": id });
        const updatedClient = updatedDocument["clients"].find(client => client._id.toString() === id);

        return { message: "Client updated successfully", client: updatedClient };
    }

    async findAllClients(indicePagina: number = 0, filter: FilterQuery<any>, gynName : string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "clients");
        const existingDocument = await dynamicModel.findOne({ ["clients"]: { $exists: true } });
        const skip = indicePagina * this.pageNumberClients;
        if (existingDocument){
            const clients = existingDocument["clients"];            
            let filteredClients = clients;
            Object.keys(filter).forEach(x => {                    
                if (filter[x] != '')
                filteredClients.filter((client: any) => client[x]===filter[x] );
            })     
            
            const paginatedClients = clients.slice(skip, skip + this.pageNumberClients);
            return paginatedClients;
            
        } else return []
    }

    async getTotalPages( filter: FilterQuery<any>, gynName: string ): Promise<number> {
        const dynamicModel = await this.generateDynamicalModel(gynName, "clients");
        const existingDocument = await dynamicModel.findOne({ ["clients"]: { $exists: true } });
        if (existingDocument){
            const clients = existingDocument["clients"];            
            let filteredClients = clients;
            Object.keys(filter).forEach(x => {                    
                if (filter[x] != '')
                filteredClients.filter((client: any) => client[x]===filter[x] );
            })              
            const totalClientes = filteredClients.length;
            const totalPages = Math.ceil(totalClientes / this.pageNumberClients);
            return totalPages;
        } else return 0
    }

    async findOneClient( id: string, gynName : string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "clients");
        const existingDocument = await dynamicModel.findOne({ ["clients"]: { $exists: true } });
        const clients = existingDocument["clients"];
        if (clients) {
            let e = false
            let c 
            clients.forEach(element => {
                if (element._id.toString() === id){
                    e = true;
                    c = element;
                }
            });
            if (e){
                return c
            } else {
                return new Error("Cliente no encontrado");
            }
        } else {
            console.error("Cliente no encontrado");
            return new Error("Cliente no encontrado");
        }
    }

    async getNumberOfClientsExist( gynName : string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "clients");
        const existingDocument = await dynamicModel.findOne({ ["clients"]: { $exists: true } });
        const clients = existingDocument["clients"];
        if (!clients) return new HttpException("No se encontró coleccion de socios.", 400);
        const res = clients.length  || 0;
        return res;
    }

    async findOneClientByCuenta( ncuenta: string, gynName : string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "clients");
        const existingDocument = await dynamicModel.findOne({ ["clients"]: { $exists: true } });
        const clients = existingDocument["clients"];
        if (clients) {
            const index = clients.findIndex(element => element.ncuenta.toString() === ncuenta)
            if (index != -1){
                return clients[index]
            } else return new Error("Cliente no encontrado")
        } else return new Error("Cliente no encontrado")
        
    }

    async deleteClient ( id : string, gynName : string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "clients");
        const existingDocument = await dynamicModel.findOne({ ["clients"]: { $exists: true } });
        if (existingDocument) {
            // Actualiza el documento eliminando el cliente con el ID especificado
            await dynamicModel.updateOne(
                { ["clients._id"]: new ObjectId(id) },  // Condición para encontrar el cliente
                { $pull: { clients: { _id: new ObjectId(id) } } }  // Operación para eliminar el cliente
            ).then( () => {
                return { message: "Client deleted successfully" };
            })
        } else {
            throw new Error("Document with clients subcollection not found");
        }
    }

    /* RUTINAS */

    async setRutina(id: string, d: string, rutina: any, gynName: string) {
        let e = await this.findOneClient(id, gynName);
        if (!e) {
            throw new Error("Cliente no encontrado");
        }
    
        const dynamicModel = await this.generateDynamicalModel(gynName, "clients");
        let rutinas: { l: string, M: string, Mi: string, J: string, V: string, S: string } = { l: '', M: '', Mi: '', J: '', V: '', S: '' };
    
        if (e.rutinas) {
            rutinas = { ...rutinas, ...e.rutinas };
        }
        switch (d) {
            case 'Lunes': rutinas.l = rutina.rutina; break;
            case 'Martes': rutinas.M = rutina.rutina; break;
            case 'Miercoles': rutinas.Mi = rutina.rutina; break;
            case 'Jueves': rutinas.J = rutina.rutina; break;
            case 'Viernes': rutinas.V = rutina.rutina; break;
            case 'Sabado': rutinas.S = rutina.rutina; break;
            default: throw new Error("Día no válido");
        }
    
        const updateFields = {};
        updateFields[`clients.$.rutinas`] = rutinas;
        const result = await dynamicModel.updateOne(
            { "clients._id": id },
            { $set: updateFields }
        );
    
        if (result.matchedCount === 0) {
            console.error("No se encontró el documento o no se realizaron cambios");
            return new HttpException("No se encontró el documento o no se realizaron cambios", 404);
        }
    
        const updatedClient = await this.findOneClient(id, gynName);   
        return updatedClient;
    }

    async getClientsNumberForSub(gynName: string, type:string){
        const dynamicModel = await this.generateDynamicalModel(gynName, "clients");
        const existingDocument = await dynamicModel.findOne({ ["clients"]: { $exists: true } });
        const clients = existingDocument["clients"] as any[];
        if (!clients) return new Error("No existe lista de clientes");

        let use = 0;
        clients.forEach(c => { if (c.tipoMensualidad === type) use++ });
        return use;
    }
}