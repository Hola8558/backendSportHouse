import { HttpException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Connection, Model, Schema } from "mongoose";
import { ObjectId } from "mongodb"
import { EjercicioDto } from "./dtos/ejercicios.dto";
import { Ejercicio } from './schemas/ejercicios.schema';
import { EjercicioUpdateDto } from './dtos/ejercicios-update.dto';
import { RutinaDto, rutinaUpdateDto } from './dtos/rutina.dto';
import { Rutina } from './schemas/rutinas.schema';

//import { Query } from 'express-serve-static-core'

@Injectable()
export class rutinasService {

    constructor( 
        @InjectModel(Ejercicio.name)private ejercicioModel: Model<Ejercicio>,
        @InjectModel(Rutina.name)private rutinaModel : Model<Rutina>,
        @InjectConnection() private readonly connection: Connection
    ){}

    /* GENERA MODELO DINÁMICO */
    async generateDynamicalModel( gynName : string, subCollection : string ) : Promise<Model<Document>> {
        let dynamicModel: Model<Document>;
        try {
            dynamicModel = this.connection.model(gynName);
        } catch (error) {
            if (error.name === 'MissingSchemaError') {
              const subSchema = new Schema({}, { strict: false });
              const mainSchema = new Schema({
              [subCollection]: [subSchema]
            }, { strict: false });
            dynamicModel = this.connection.model<Document>(gynName, mainSchema);
            } else {
                throw error;
            }
        }

        return dynamicModel;
    }

    /* EJERCICIOS */
    async createEjercicio( ejercicio : EjercicioDto ){
        const createdEjercicio = new this.ejercicioModel(ejercicio);
        createdEjercicio.save();
    }

    async updateEjercicio ( id : string, ejercicio : EjercicioUpdateDto ){
        return this.ejercicioModel.findByIdAndUpdate( id, ejercicio, {
            new: true,
        }).exec();
    }

    async findAllEjercicios(){
        return this.ejercicioModel.find().exec();
    }

    async findOneEjercicio( id: string ){
        return this.ejercicioModel.findById(id).exec();
    }

    /* Paginator */
    async getEjerciciosByValue(query : any){
        const keyword = query.keyword ? {
            $or: [
                {nombre: {
                    $regex: query.keyword,
                    $options: 'i'
                }},
                {grupoMuscular: {
                    $regex: query.keyword,
                    $options: 'i'
                }}
            ]
        } : { }
        
        const results = await this.ejercicioModel.find( { ...keyword } );
        return results;
    }

    async getEjerciciosByPage( ){
        const gruposMusculares = await this.ejercicioModel.distinct('grupoMuscular');
        const ejerciciosPaginados = [];
        for (const grupoMuscular of gruposMusculares) {
            const ejerciciosGrupo = await this.ejercicioModel
                .find({ grupoMuscular })
                .limit(6) // Obtener solo 3 ejercicios por grupo muscular
                .exec();
    
            ejerciciosPaginados.push(...ejerciciosGrupo);
        }

        return ejerciciosPaginados;
    }

    async getEjerciciosPaginados(grupoMuscular: string, indicePagina: number = 0) {
        const limitePagina = 4; // Número de ejercicios por página
        const skip = indicePagina * limitePagina; // Calcular el número de documentos a saltar
        
        const query = grupoMuscular ? { grupoMuscular } : {};
    
        const ejerciciosPaginados = await this.ejercicioModel
            .find(query)
            .skip(skip) // Saltar los documentos anteriores
            .limit(limitePagina) // Limitar el número de documentos a devolver
            .exec();
        
        return ejerciciosPaginados;
    }

    async getgruposMusculares ( ) {
        return await this.ejercicioModel.distinct('grupoMuscular');
    }

    /* Paginator */

    async deleteEjercicio ( id : string ){
        return this.ejercicioModel.findByIdAndDelete(id).exec();
    }

    /** RUTINAS */

    async createRutina( rutina: any, gynName : string ): Promise<any> {
        if (!rutina) return new HttpException("Rutina no establecida", 404);
        const dynamicModel = await this.generateDynamicalModel(gynName, "rutinas");

        // Generar un nuevo ObjectId para la rutina
        const newRutina = { ...rutina, _id: new ObjectId() };
        let existingDocument = await dynamicModel.findOne({ ["rutinas"]: { $exists: true } });
        if (existingDocument) {
            existingDocument["rutinas"].push(newRutina);
            await existingDocument.save();
        } else {
            const createdDocument = new dynamicModel({ ["rutinas"]: [newRutina] });
            await createdDocument.save();
            existingDocument = createdDocument;
        }

        return { message: "Rutina creada correctamente", id: newRutina._id };
        /* let newExistingDocument = await dynamicModel.findOne({ ["rutinas"]: { $exists: true } });

        if (newExistingDocument && newExistingDocument["rutinas"] && newExistingDocument["rutinas"].length > 0) {
            console.log(newExistingDocument["rutinas"]);
            
            const lastRutina = newExistingDocument["rutinas"][newExistingDocument["rutinas"].length - 1];
            
        } else {
            return new HttpException("Error al crear la rutina", 500);
        } */
    
        /* const existingDocument = await dynamicModel.findOne({ ["rutinas"]: { $exists: true } });
        rutina._id = new ObjectId();
        if (existingDocument) {
            existingDocument["rutinas"].push(rutina);
            await existingDocument.save();
        } else {
            const createdUser = new dynamicModel({ ["rutinas"]: [rutina] });
            await createdUser.save();
        }
        const newExistingDocument = await dynamicModel.findOne({ ["rutinas"]: { $exists: true } });
        console.log(newExistingDocument["rutinas"][newExistingDocument["rutinas"].length - 1]._id.toString());
        
        return { message: "Rutina creada correctamente", id: newExistingDocument["rutinas"][newExistingDocument["rutinas"].length - 1]._id.toString() }; */
    }

    async findAllRutinas(){
        const rutinas = await this.rutinaModel.find({ favorites: 0 }).exec();
        return rutinas;
    }

    async getAllRutinasStarred(){
        const rutinas = await this.rutinaModel.find({ favorites: 1 }).exec();
        return rutinas;
    }

    async findOneRutina(id:string){
        return this.rutinaModel.findById(id).exec();
    }

    async deleteRutina ( id : string, gynName : string ){
        //return this.rutinaModel.findByIdAndDelete(id).exec();
        const dynamicModel = await this.generateDynamicalModel(gynName, "rutinas");
        const existingDocument = await dynamicModel.findOne({ ["rutinas"]: { $exists: true } });
        if (existingDocument) {
            const result = await dynamicModel.updateOne(
                { ["rutinas._id"]: new ObjectId(id) },  // Condición para encontrar la rutina por su ObjectId
                { $pull: { rutinas: { _id: new ObjectId(id) } } }  // Operación para eliminar la rutina
            );
    
            if (result.modifiedCount > 0) {
                console.log("Rutina deleted successfully");
                return { message: "Rutina deleted successfully" };
            } else {
                console.error("Rutina no encontrada");
                return new HttpException("Rutina no encontrada", 404);
            }
            // Actualiza el documento eliminando el cliente con el ID especificado
           /*  await dynamicModel.deleteOne({ ["rutinas._id"]:id }).then((x) => {
                console.log("Rutina deleted successfully");
                console.log(x);
                
                return { message: "Rutina deleted successfully" };
            }) */
            /* await dynamicModel.updateOne(
                { ["rutinas._id"]: id },  // Condición para encontrar el cliente
                { $pull: { rutinas: { _id: id } } }  // Operación para eliminar el cliente
            ); */
            
        } else {
            console.error("Rutina no encontrada");
            return new HttpException("Rutina no encontrada", 404);
        }
    }

    async updateRutina ( id : string , rutina: rutinaUpdateDto ){
        return this.rutinaModel.findByIdAndUpdate( id, rutina, {
            new: true,
        }).exec();
    }

    async updateRutinaEjercicios ( id : string , ejercicios: any ){
        const updateData = {
            $set: { ejercicios: ejercicios } // Aquí se especifica el campo 'ejercicios' que se actualizará
        };
        return this.rutinaModel.findByIdAndUpdate(id, updateData, {
            new: true,
        }).exec();
    
    }

}