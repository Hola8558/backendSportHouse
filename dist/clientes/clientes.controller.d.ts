/// <reference types="multer" />
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
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { ClientesService } from "./clientes.service";
import { CreateClientDto } from './dtos/create-client.dto';
import { UpdateClientDto, rutinasDTO } from './dtos/update-client.dto';
export declare class ClientesController {
    private clientesService;
    constructor(clientesService: ClientesService);
    loginSocio(loginUser: {
        email: string;
    }): Promise<{
        userData: import("mongoose").Document<unknown, {}, import("./schemas/clientes.schema").Client> & import("./schemas/clientes.schema").Client & {
            _id: import("mongoose").Types.ObjectId;
        };
        token: string;
    }>;
    crearCliente(createdClient: CreateClientDto): Promise<void>;
    uploadProfilePhoto(res: any, id: string, file: Express.Multer.File): Promise<any>;
    update(id: string, client: UpdateClientDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/clientes.schema").Client> & import("./schemas/clientes.schema").Client & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    setRutina(id: string, day: string, rutina: rutinasDTO): Promise<import("mongoose").Document<unknown, {}, import("./schemas/clientes.schema").Client> & import("./schemas/clientes.schema").Client & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/clientes.schema").Client> & import("./schemas/clientes.schema").Client & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/clientes.schema").Client> & import("./schemas/clientes.schema").Client & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    delete(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/clientes.schema").Client> & import("./schemas/clientes.schema").Client & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
