import { HttpException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Connection, Model, Schema } from "mongoose";
import { ObjectId } from "mongodb"
import { EjercicioDto } from "./dtos/ejercicios.dto";
import { Ejercicio } from './schemas/ejercicios.schema';
import { EjercicioUpdateDto } from './dtos/ejercicios-update.dto';
import { RutinaDto, rutinaUpdateDto } from './dtos/rutina.dto';
import { Rutina } from './schemas/rutinas.schema';
import axios from 'axios';
import { log } from 'console';

//import { Query } from 'express-serve-static-core'

@Injectable()
export class rutinasService {

    constructor( 
        @InjectModel(Ejercicio.name)private ejercicioModel: Model<Ejercicio>,
        //@InjectModel(Rutina.name)private rutinaModel : Model<Rutina>,
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

    /* EJERCICIOS */
    async createEjercicio( ejercicio : EjercicioDto ){
        const createdEjercicio = new this.ejercicioModel(ejercicio);
        createdEjercicio.save();
    }

    async updateEjercicio ( gynName: string, id : string, ejercicio : EjercicioUpdateDto ){
        const prevEjercicio = await this.ejercicioModel.findById(id).exec();
        let result;
        let updates = {};
        for (let key of Object.keys(ejercicio)){
            if (prevEjercicio[key] != ejercicio[key] && key != '_id')
                updates = {...updates, [key]:ejercicio[key]}
        }
        if(prevEjercicio.url === ejercicio.url){
            //Actialización local
            result = await this.localEjercicioUpdate( gynName, id, updates);
        }

        //Validación de imagen
        const isValid = await this.validateImageUrl(prevEjercicio.url);   
        
        if (!isValid){
            //Actialización global de imagen
            result = await this.ejercicioModel.findByIdAndUpdate( id, {url: ejercicio.url}, {
                new: true,
            }).exec();
        } else {
            updates = {...updates, url:ejercicio.url}
        }
        const hasMoreThanOneKey = Object.keys(updates).length > 1;
        if (hasMoreThanOneKey){
            //Actialización local            
            result = await this.localEjercicioUpdate( gynName, id, updates);
        }
        return result
        //return this.ejercicioModel.findByIdAndUpdate( id, ejercicio, {
        //    new: true,
        //}).exec();
    }

    async localEjercicioUpdate( gynName: string, id : string, updates : Object ){
        let result;
        
        const dynamicModel = await this.generateDynamicalModel(gynName, "ejercicios");
        const existingDocument = await dynamicModel.findOne({ ["ejercicios"]: { $exists: true } });        
        const ejecicios = existingDocument["ejercicios"];
        if (ejecicios) {            
            if (ejecicios.length === 0){
                const existingDocument = await dynamicModel.findOne({ ["ejercicios"]: { $exists: true } });
                updates = { _id: new ObjectId(id), ...updates }
                existingDocument["ejercicios"].push(updates);
                result = await existingDocument.save();
            } else
            ejecicios.forEach( async element => {         
                if (element._id.toString() === id){
                    let newUpdates = {};
                    for (let key of Object.keys(updates)){
                        newUpdates = {...newUpdates, [`ejercicios.$.${key}`]:updates[key]}
                    }
                    try {
                        result = await dynamicModel.updateOne(
                            { "ejercicios._id": id },
                            { $set: newUpdates },
                        );
                    } catch (error) {
                        console.error(error);
                        throw new Error('Error updating or inserting ejercicio');
                    }
                }
            });
        } else {
            const existingDocument = await dynamicModel.findOne({ ["ejercicios"]: { $exists: true } });
            updates = { _id: new ObjectId(id), ...updates }
            existingDocument["ejercicios"].push(updates);
            result = await existingDocument.save();
        }
        return result;
    }

    async validateImageUrl(url: string): Promise<boolean> {
        const base64Pattern = /^data:image\/(jpeg|png|gif|bmp|webp);base64,/;

        // Verifica si es una cadena base64
        if (base64Pattern.test(url)) {
            return this.validateBase64Image(url);
        }

        try {
          const response = await axios.head(url);
          return response.status === 200 && response.headers['content-type'].startsWith('image/');
        } catch (error) {
          return false;
        }
    }

    validateBase64Image(base64: string): boolean {
        const imagePrefixPattern = /^data:image\/(jpeg|png|gif|bmp|webp);base64,/;
        if (!imagePrefixPattern.test(base64)) {
          return false;
        }
      
        const base64Data = base64.replace(imagePrefixPattern, '');
      
        try {
          atob(base64Data);
          return true;
        } catch (error) {
          return false;
        }
      }

    async findAllEjercicios( gynName : string ){
        let ejerciciosGlobal = await this.ejercicioModel.find().exec();
        const dynamicModel = await this.generateDynamicalModel(gynName, "ejercicios");
        const existingDocument = await dynamicModel.findOne({ ["ejercicios"]: { $exists: true } });        
        const ejerciciosLocal = existingDocument["ejercicios"];
        
        for ( let e of ejerciciosLocal ){
            let index = -1;
            index = ejerciciosGlobal.findIndex( eje => eje._id.toString() === e._id.toString())
            //ejerciciosGlobal.map( (eje, id) => {
            //    if (eje._id.toString() === e._id.toString() )
            //        index = id;
            //})
            
            if (index != -1)
                Object.keys(e._doc).forEach( key => {            
                    if(e[key] != '_id')
                    ejerciciosGlobal[index][key] = e[key];
                })
        }
        return await this.validateEjerciciosDeleted( gynName, ejerciciosGlobal );
    }

    async findOneEjercicio( gynName : string, id: string ){
        let ejercicio = await this.ejercicioModel.findById(id).exec();
        ejercicio = await this.validateEjercicio(gynName, ejercicio);
        const dynamicModel = await this.generateDynamicalModel(gynName, "ejerciciosDeleted");
        let existingDocument = await dynamicModel.findOne({ ["ejerciciosDeleted"]: { $exists: true } });
        existingDocument["ejerciciosDeleted"].forEach(element => {
            if(id.toString() === element._id.toString())
                return undefined;
        });
        return ejercicio;
    }

    async validateEjercicio( gynName: string, ejercicio ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "ejercicios");
        const existingDocument = await dynamicModel.findOne({ ["ejercicios"]: { $exists: true } });        
        const ejecicios = existingDocument["ejercicios"];
        if (ejecicios && ejercicio) {
            let index = -1;
            index = ejecicios.findIndex( eje => eje._id.toString() === ejercicio._id.toString())
            if(index != -1)
                for (let key of Object.keys(ejercicio._doc)){
                    if (ejecicios[index][key])
                        ejercicio[key] = ejecicios[index][key];
                }
        }

        return ejercicio
    }

    async validateEjercicioGroup( gynName: string, ejerciciosArray ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "ejercicios");
        const existingDocument = await dynamicModel.findOne({ ["ejercicios"]: { $exists: true } });        
        const ejecicios = existingDocument["ejercicios"];
        if (ejecicios && ejerciciosArray) {
            for (let ejer of ejecicios){
                let index = -1;
                index = ejerciciosArray.findIndex( eje => eje._id.toString() === ejer._id.toString())
                if(index != -1)
                    for (let key of Object.keys(ejerciciosArray[index]._doc)){
                        if (ejer[key])
                            ejerciciosArray[index][key] = ejer[key];
                    }
            }
        }

        return ejerciciosArray
    }

    /* Paginator */
    async getEjerciciosByValue( gynName : string, query : any){
        const ejercicios = await this.findAllEjercicios(gynName);        
        const reuslt = ejercicios.filter( ejercicio => {
            let matches = false;
            let k = query.keyword.toLowerCase();
            if (query && query.keyword){
                matches = ejercicio.grupoMuscular.toLowerCase().includes(k)
                    || ejercicio.nombre.toLowerCase().includes(k);
            }
            return matches;
        })        
        return await this.validateEjerciciosDeleted( gynName, reuslt );
        /* console.log(query.keyword);
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
        return results; */
    }

    async getEjerciciosByPage( gynName: string ){
        const gruposMusculares = await this.ejercicioModel.distinct('grupoMuscular');
        const ejerciciosPaginados = [];
        for (const grupoMuscular of gruposMusculares) {
            const ejerciciosGrupo = await this.ejercicioModel
                .find({ grupoMuscular })
                .limit(6) // Obtener solo 3 ejercicios por grupo muscular
                .exec();
    
            ejerciciosPaginados.push(...ejerciciosGrupo);
        }
        
        //return ejerciciosPaginados;
        return await this.validateEjerciciosDeleted( gynName, ejerciciosPaginados );
    }

    async getEjerciciosPaginados(gynName : string, grupoMuscular: string, indicePagina: number = 0) {
        const limitePagina = 4; // Número de ejercicios por página
        const skip = indicePagina * limitePagina; // Calcular el número de documentos a saltar
        
        const query = grupoMuscular ? { grupoMuscular } : {};
    
        const ejerciciosPaginados = await this.ejercicioModel
            .find(query)
            .skip(skip) // Saltar los documentos anteriores
            .limit(limitePagina) // Limitar el número de documentos a devolver
            .exec();
        /* for (let e of ejerciciosPaginados){
            const isValid = await this.validateImageUrl(e.url);
            if (!isValid)
            console.log(`${e.nombre} -> ${e.url}`);
        } */
        let result = await this.validateEjercicioGroup(gynName, ejerciciosPaginados);
        /* for (let e of ejerciciosPaginados){
            const ejercicio = await this.validateEjercicioGroup(gynName, e);
            result.push(ejercicio);
        } */
        return await this.validateEjerciciosDeleted( gynName, result );
    }

    async validateEjerciciosDeleted( gynName : string, result : any[] ){
        let ejercicios = result;
        const dynamicModel = await this.generateDynamicalModel(gynName, "ejerciciosDeleted");
        let existingDocument = await dynamicModel.findOne({ ["ejerciciosDeleted"]: { $exists: true } });
        existingDocument["ejerciciosDeleted"].forEach(element => {
            result.forEach((e,i) => {
                if(e._id.toString() === element._id.toString())
                    ejercicios.splice( i, 1 )
            });
        });
        return ejercicios;
    }

    async getgruposMusculares ( ) {
        return await this.ejercicioModel.distinct('grupoMuscular');
    }

    /* Paginator */

    async deleteEjercicio ( gynName: string, id : string ){
        //return this.ejercicioModel.findByIdAndDelete(id).exec();
        const dynamicModel = await this.generateDynamicalModel(gynName, "ejerciciosDeleted");
        let existingDocument = await dynamicModel.findOne({ ["ejerciciosDeleted"]: { $exists: true } });
        existingDocument["ejerciciosDeleted"].push({_id:new ObjectId(id)});
        return await existingDocument.save();
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

    /* async findAllRutinas(){
        const rutinas = await this.rutinaModel.find({ favorites: 0 }).exec();
        return rutinas;
    } */

    async getAllRutinasStarred(gynName : string){
        //const rutinas = await this.rutinaModel.find({ favorites: 1 }).exec();
        //return rutinas;
        const dynamicModel = await this.generateDynamicalModel(gynName, "rutinas");
        const existingDocument = await dynamicModel.findOne({ ["rutinas"]: { $exists: true } });        
        let result = [];
        for (let element of existingDocument["rutinas"]){
            if (element && element.favorites === 1)
                result.push(element)
        }
        return result;
    }

    async findOneRutina(gynName : string, id:string){
        const dynamicModel = await this.generateDynamicalModel(gynName, "rutinas");
        const existingDocument = await dynamicModel.findOne({ ["rutinas"]: { $exists: true } });        
        const rutinas = existingDocument["rutinas"]
        if (rutinas) {
            let e = false
            let r 
            rutinas.forEach(element => {                
                if (element._id.toString() === id){
                    e = true;
                    r = element;
                }
            });
            if (e){
                return r
            } else {
                return new HttpException("Rutina no encontrada", 404);
            }
        } else {
            return new HttpException("Rutina no encontrada", 404);
        }
        //return this.rutinaModel.findById(id).exec();
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
        /* return this.rutinaModel.findByIdAndUpdate( id, rutina, {
            new: true,
        }).exec(); */
    }

    async updateRutinaEjercicios ( gynName: string, id : string , ejercicios: any ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "rutinas");
        const updateFields = {['rutinas.$.ejercicios'] : ejercicios};
        const result = await dynamicModel.updateOne(
            { "rutinas._id": id },
            { $set: updateFields }
        );
        if (!result) {
            console.error("Rutina not found or no changes made");
            return new HttpException("Rutina no encontrada", 404);
        }

        // Volver a cargar el documento actualizado
        const updatedDocument = await dynamicModel.findOne({ "rutinas._id": id });
        const updatedRutina = updatedDocument["rutinas"].find(ruti => ruti._id.toString() === id);

        return { message: "Rutina updated successfully", user: updatedRutina };
        /* const updateData = {
            $set: { ejercicios: ejercicios } // Aquí se especifica el campo 'ejercicios' que se actualizará
        };
        return this.rutinaModel.findByIdAndUpdate(id, updateData, {
            new: true,
        }).exec(); */
    
    }

}