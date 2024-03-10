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
import { rutinasService } from './rutinas.service';
import { EjercicioDto } from './dtos/ejercicios.dto';
import { EjercicioUpdateDto } from './dtos/ejercicios-update.dto';
import { RutinaDto } from './dtos/rutina.dto';
export declare class rutinasController {
    private rutinasService;
    constructor(rutinasService: rutinasService);
    crearEjercicio(ejercicio: EjercicioDto): Promise<void>;
    updateEjercicio(id: string, ejercicio: EjercicioUpdateDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/ejercicios.schema").Ejercicio> & import("./schemas/ejercicios.schema").Ejercicio & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findAllEjercicios(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/ejercicios.schema").Ejercicio> & import("./schemas/ejercicios.schema").Ejercicio & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    findOneEjercicio(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/ejercicios.schema").Ejercicio> & import("./schemas/ejercicios.schema").Ejercicio & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    deleteEjercicios(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/ejercicios.schema").Ejercicio> & import("./schemas/ejercicios.schema").Ejercicio & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    crearRutina(rutina: RutinaDto): Promise<void>;
    findAllRutinas(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/rutinas.schema").Rutina> & import("./schemas/rutinas.schema").Rutina & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    findOneRutina(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/rutinas.schema").Rutina> & import("./schemas/rutinas.schema").Rutina & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
