/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { Client } from "./schemas/clientes.schema";
import { Model } from "mongoose";
import { CreateClientDto } from "./dtos/create-client.dto";
import { UpdateClientDto } from "./dtos/update-client.dto";
import { ImagesDto } from "./dtos/image-profile.dto";
export declare class ClientesService {
    private clientModel;
    constructor(clientModel: Model<Client>);
    createClient(client: CreateClientDto): Promise<void>;
    uploadProfileImage(id: string, filename: ImagesDto): Promise<import("mongoose").Document<unknown, {}, Client> & Client & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateClient(id: string, client: UpdateClientDto): Promise<import("mongoose").Document<unknown, {}, Client> & Client & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findAllClients(): Promise<(import("mongoose").Document<unknown, {}, Client> & Client & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    findOneClient(id: string): Promise<import("mongoose").Document<unknown, {}, Client> & Client & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    deleteClient(id: string): Promise<import("mongoose").Document<unknown, {}, Client> & Client & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    setRutina(id: string, d: string, rutina: any): Promise<import("mongoose").Document<unknown, {}, Client> & Client & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findRutina(id: string, d: string): Promise<void>;
    loginSocio(ncuenta: string): Promise<{
        userData: import("mongoose").Document<unknown, {}, Client> & Client & {
            _id: import("mongoose").Types.ObjectId;
        };
        token: string;
    }>;
    fechaYaPaso(fechaString: string): boolean;
}
