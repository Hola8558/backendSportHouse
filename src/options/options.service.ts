import { HttpException, Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
//import { Options } from "./schemas/options.schema";
import { Connection, Model, Schema } from "mongoose";
import { createReadStream } from "fs";
import { GridFSBucket } from 'mongodb';

@Injectable()
export class OptionsService {

    private bucket: GridFSBucket;

    constructor(
        //@InjectModel(Options.name) private optionsModel: Model<Options>,
        @InjectConnection() private readonly connection: Connection,
    ){
        this.bucket = new GridFSBucket(this.connection.db, { bucketName: 'uploads' });
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
    
    async setWspId( gynName: string, wspId: any ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });        
        existingDocument["opciones"].push( { key:"wspId", value: wspId.id } );
        return await existingDocument.save();
    }

    async setGymName( gynName: string, name: any ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });        
        existingDocument["opciones"].push( { key:"name", value: name.name } );
        return await existingDocument.save();
    }

    async setGymImg( gynName: string, img: any ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });        
        existingDocument["opciones"].push( { key:"img", value: img.img } );
        return await existingDocument.save();
    }

    async setGymFavicon( gynName: string, favicon: any ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });        
        existingDocument["opciones"].push( { key:"favicon", value: favicon.favicon } );
        return await existingDocument.save();
    }

    async setmodulesShow ( gynName: string, modules: {modules: string[]} ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        existingDocument["opciones"].push( { key:"modulesShow", value: modules.modules } );
        return await existingDocument.save();
    }

    async deleteGymDef (gynName : string, confirmation : string){
        if (gynName != confirmation)
            return new HttpException("Error en nombre del gimnasio", 403);

        try {
            await this.connection.db.dropCollection(gynName);
            return { message: `Collection ${gynName} deleted successfully.` };
        } catch (error) {
            if (error.code === 26) {
              // 26 means the collection doesn't exist
              return { message: `Collection ${gynName} does not exist.` };
            }
            return new HttpException(error, 500)
        }
    }


    async gwtSwspId( gynName: string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];
        let result;
        opciones.forEach( (option) => {
           if ( option.key === "wspId" ) 
            result = option.value;
        });
        if ( !result )
            return new HttpException("WhatsApp Id have not declareted.", 404);

        return { res: result }        
    }

    async gwtName( gynName: string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];
        let result;
        opciones.forEach( (option) => {
           if ( option.key === "name" ) 
            result = option.value;
        });
        if ( !result )
            return new HttpException("Name have not declareted.", 404);

        return { res: result }        
    }

    async gwtImg( gynName: string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];
        let result;
        opciones.forEach( (option) => {
           if ( option.key === "img" ) 
            result = option.value;
        });
        if ( !result )
            return new HttpException("Img have not declareted.", 404);

        return { res: result }        
    }

    async gwtFavicon( gynName: string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];
        let result;
        opciones.forEach( (option) => {
           if ( option.key === "favicon" ) 
            result = option.value;
        });
        if ( !result )
            return new HttpException("Favicon have not declareted.", 404);

        return { res: result }        
    }

    async gwtmodulesShow( gynName: string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];
        let result;
        opciones.forEach( (option) => {
           if ( option.key === "modulesShow" ) 
            result = option.value;
        });
        if ( !result )
            return new HttpException("Modules Show have not declareted.", 404);

        return { res: result }        
    }

    async gwtvalidGym ( gynName : string ) : Promise<{result: boolean}>{
        const names = await this.gwtAllGymNames();
        return {result: names.res.includes(gynName)}
    }

    async gwtAllGymNames () : Promise<{res: string[]}>{
        const collections = await this.connection.db.listCollections().toArray();
        const preres = collections.map((collection) => collection.name)
        const res = preres.filter( c => {  
            if (c != 'gymadmingoodkrizs' && c != 'notes' && c != 'ejercicios' && c != 'users'){
                return true;
            } else return false;
        })
        
        return {res}
    }


    async updateWspId ( gynName : string, id : any ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const updateFields = {["opciones.$.value"]: id.id};
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];

        let ide = -1;
        opciones.forEach((element) => {
            if (element.key === 'wspId')
                ide = element._id.toString();
        });
        let result;
        if (ide != -1){
            result = await dynamicModel.updateOne(
                { "opciones._id": ide },
                { $set: updateFields }
            );
        }

        if (!result || result.matchedCount === 0) {
            return new HttpException("Key not found or no changes made", 503);
        }

        // Volver a cargar el documento actualizado
        const updatedDocument = await dynamicModel.findOne({ "opciones._id": ide });
        const updatedClient = updatedDocument["opciones"].find(opt => opt._id.toString() === ide);

        return { message: "WspId updated successfully", name: updatedClient };
    }
    
    async updateGymName ( name : any, gynName : string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const updateFields = {["opciones.$.value"]: name.name};
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];

        let id = -1;
        opciones.forEach((element) => {
            if (element.key === 'name')
                id = element._id.toString();
        });
        let result;
        if (id != -1){
            result = await dynamicModel.updateOne(
                { "opciones._id": id },
                { $set: updateFields }
            );
        }

        if (!result || result.matchedCount === 0) {
            return new HttpException("Key not found or no changes made", 503);
        }

        // Volver a cargar el documento actualizado
        const updatedDocument = await dynamicModel.findOne({ "opciones._id": id });
        const updatedClient = updatedDocument["opciones"].find(opt => opt._id.toString() === id);

        return { message: "Name updated successfully", name: updatedClient };
    }

    async updateGymImg ( img : any, gynName : string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const updateFields = {["opciones.$.value"]: img.img};
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];

        let id = -1;
        opciones.forEach((element) => {
            if (element.key === 'img')
                id = element._id.toString();
        });
        let result;        
        if (id != -1){
            result = await dynamicModel.updateOne(
                { "opciones._id": id },
                { $set: updateFields }
            );
        }
        if (!result || result.matchedCount === 0) {
            return new HttpException("Key not found or no changes made", 503);
        }

        // Volver a cargar el documento actualizado
        const updatedDocument = await dynamicModel.findOne({ "opciones._id": id });
        const updatedClient = updatedDocument["opciones"].find(opt => opt._id.toString() === id);

        return { message: "Img updated successfully", name: updatedClient };
    }

    async updateGymFavicon ( favicon : any, gynName : string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const updateFields = {["opciones.$.value"]: favicon.favicon};
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];
        let id = -1;
        opciones.forEach((element) => {
            if (element.key === 'favicon')
                id = element._id.toString();
        });
        let result;
        if (id != -1){
            result = await dynamicModel.updateOne(
                { "opciones._id": id },
                { $set: updateFields }
            );
        }

        if (!result || result.matchedCount === 0) {
            return new HttpException("Key not found or no changes made", 503);
        }

        // Volver a cargar el documento actualizado
        const updatedDocument = await dynamicModel.findOne({ "opciones._id": id });
        const updatedClient = updatedDocument["opciones"].find(opt => opt._id.toString() === id);

        return { message: "Favicon updated successfully", name: updatedClient };
    }

    async updateModulesShow ( modules : string[], gynName : string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const updateFields = {["opciones.$.value"]: modules};
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];
        let id = -1;
        opciones.forEach((element) => {
            if (element.key === 'modulesShow')
                id = element._id.toString();
        });
        let result;
        if (id != -1){
            result = await dynamicModel.updateOne(
                { "opciones._id": id },
                { $set: updateFields }
            );
        }

        if (!result || result.matchedCount === 0) {
            return new HttpException("Key not found or no changes made", 503);
        }

        // Volver a cargar el documento actualizado
        const updatedDocument = await dynamicModel.findOne({ "opciones._id": id });
        const updatedClient = updatedDocument["opciones"].find(opt => opt._id.toString() === id);

        return { message: "Modules to show updated successfully", name: updatedClient };
    }

    async changeAudio( file: Express.Multer.File, gynName : string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];

        const audioFile = {
            filename: file.originalname,
            contentType: file.mimetype,
            data: Buffer.from(file.buffer).toString('base64'),
        };

        let id = -1;
        opciones.forEach((element) => {
            if (element.key === 'audioFile')
                id = element._id.toString();
        });
        let result;
        if (id === -1){
            if(existingDocument){
                existingDocument["opciones"].push({ key : 'audioFile', value: audioFile });
                result = await existingDocument.save();
            } else {
                const newDocument = new dynamicModel({ ["opciones"]: [{ key : 'audioFile', value: audioFile }] });
                result =  await newDocument.save();
            }
        } else {
            result = await dynamicModel.updateOne(
                { "opciones._id": id }, // Crear solo si no existe
                { $set: { ["opciones.$.value"]: audioFile } },
            );
        }
        if (result){
            const r = await this.getAudioFile(gynName);
            return { message:'Audio succesfully changed', result : r }
        } else {
            return new HttpException("Fallo al actualizar audio", 500)
        }
    }

    async getAudioFile(gynName: string): Promise<any> {
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
    
        if (existingDocument) {
            const audioOption = existingDocument["opciones"].find(opt => opt.key === 'audioFile');
            if (audioOption) {
                //console.log(audioOption.value.data);
                
                return {
                    data: audioOption.value.data,
                };
            }
        }
        return new HttpException('Audio file not found', 404);
    }
    //async getAudioFile(gynName: string): Promise<any> {
    //    const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
    //    const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
    //
    //    if (existingDocument) {
    //        const audioOption = existingDocument["opciones"].find(opt => opt.key === 'audioFile');
    //        if (audioOption) {
    //            return {
    //                filename: audioOption.value.filename,
    //                contentType: audioOption.value.contentType,
    //                data: audioOption.value.data,
    //            };
    //        }
    //    }
    //    throw new Error('Audio file not found');
    //}
}