import { HttpException, Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, Model, Schema } from "mongoose";
import { GridFSBucket } from 'mongodb';
import { DuplicateElementError } from "src/usuarios/error-manager";
import { Subscription } from "./dtos/subscription-interface.interface";
import { ClientesService } from "src/clientes/clientes.service";

@Injectable()
export class OptionsService {

    private bucket: GridFSBucket;

    constructor(
        //@InjectModel(Options.name) private optionsModel: Model<Options>,
        @InjectConnection() private readonly connection: Connection,
        private clientSvc: ClientesService,
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

    async fileExistPrev( model:any, key:string ){
        type Opcion = {
            key: string;
            value: string;
        };
        
        type GymDocument = {
            _id: any;
            opciones: Opcion[];
        };
        const copiaDocs = await model as GymDocument;
        return copiaDocs.opciones.find((opcion: { key: string, value: string }) => opcion.key === key);
    }
    
    
    async setWspId( gynName: string, wspId: any ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const wspIdExists = existingDocument["opciones"].some(o => o.key === 'wspId');
        if (wspIdExists) throw new DuplicateElementError('WspId Duplicated');
        existingDocument["opciones"].push( { key:"wspId", value: wspId.id } );
        return await existingDocument.save();
    }

    async setGymName( gynName: string, name: any ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });        
        //existingDocument["opciones"].push( { key:"name", value: name.name } );
        const gymNameExists = existingDocument["opciones"].some(o => o.key === 'name');
        if (gymNameExists) throw new DuplicateElementError(name);
        existingDocument["opciones"].push( { key:"name", value: name } );
        return await existingDocument.save();
    }

    async setGymImg( gynName: string, img: any ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });        
        //existingDocument["opciones"].push( { key:"img", value: img.img } );
        const imageGymExists = existingDocument["opciones"].some(o => o.key === 'img');
        if (imageGymExists) throw new DuplicateElementError('Duplicated Image');
        existingDocument["opciones"].push( { key:"img", value: img.img } );
        return await existingDocument.save();
    }

    async setGymFavicon( gynName: string, favicon: any ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });        
        //existingDocument["opciones"].push( { key:"favicon", value: favicon.favicon } );
        const faviconGymExists = existingDocument["opciones"].some(o => o.key === 'favicon');
        if (faviconGymExists) throw new DuplicateElementError('Favicon Duplicated');
        existingDocument["opciones"].push( { key:"favicon", value: favicon.favicon } );
        return await existingDocument.save();
    }

    async setmodulesShow ( gynName: string, modules: {modules: string[]} ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        //existingDocument["opciones"].push( { key:"modulesShow", value: modules.modules } );
        const modulesShowExists = existingDocument["opciones"].some(o => o.key === 'modulesShow');
        if (modulesShowExists) throw new DuplicateElementError('Modules Show Duplicated');
        existingDocument["opciones"].push( { key:"modulesShow", value: modules.modules } );
        return await existingDocument.save();
    }

    async setSubscriptions( gynName:string, subs: Subscription[] ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ "opciones": { $exists: true } });
        if (!existingDocument) return new HttpException("No se encontró el objeto 'opciones'", 500);

        const opciones = JSON.parse(JSON.stringify(existingDocument["opciones"]));
        let subsObj = opciones.find(opc => opc.key === "subscriptions");

        if (!subsObj) opciones.push({ key: "subscriptions", subs });
        subsObj = opciones.find(opc => opc.key === "subscriptions");

        subsObj.subs = subs.map(sub => ({ ...sub }));

        existingDocument["opciones"] = opciones;
        existingDocument.markModified('opciones');

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


    async getAppErrors( gynName: string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];
        let result;
        opciones.forEach( (option) => {
           if ( option.key === "showErrorsClient" ) 
            result = {show:option.show, msg: option.value};
        });
        if ( !result )
            return new HttpException("App errors have not declareted.", 404);

        return { res: result }   
    }

    async getStatusSubscription( gynName: string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"] as any[] || [];
        const obj = opciones.find(opc => opc.key === "statusSubscription");
        if ( opciones.length === 0 || !obj ) return new HttpException("Couldn't get subscription status.", 404);

        const res = {status:obj.value, startDate:obj.startDate, endDate:obj.endDate}
        
        return { res };
    }

    async getNumberSociosMax( gynName: string ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];
        let result;
        opciones.forEach( (option) => {
           if ( option.key === "numberSociosMax" ) 
            result = option.value;
        });
        if ( !result )
            return new HttpException("Couldn't get max socios number.", 404);

        return { res: result }   
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

    async getSubscriptions( gynName:string ) {
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const subscriptions = (existingDocument["opciones"].filter(opc => opc.key === "subscriptions"))[0];
        if(!subscriptions) return new HttpException("Sin subscripciones encontradas.", 404);

        for (let s = 0; s < subscriptions.subs.length; s++){
            subscriptions.subs[s].clientes = await this.clientSvc.getClientsNumberForSub(gynName, subscriptions.subs[s].type);
        }
        
        return { subscriptions:subscriptions.subs }
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
        //const updateFields = {["opciones.$.value"]: img.img};
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];
        
        let id = -1;
        opciones.forEach((element) => {
            if (element.key === 'img') id = element._id;
        });
        let result;        
        if (id != -1){
            result = await dynamicModel.updateOne(
                { "opciones._id": id },
                { $set: { "opciones.$.value": img.img } }
            );
        }       

        if (!result || result.matchedCount === 0) {
            return new HttpException("Key not found or no changes made", 503);
        }

        // Volver a cargar el documento actualizado
        //const updatedDocument = await dynamicModel.findOne({ "opciones._id": id });
        //const updatedClient = updatedDocument["opciones"].find(opt => opt._id.toString() === id);

        return { message: "Img updated successfully" };
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

    async replacemodulesShow(gynName: string, modules: any) {
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const updateFields = {["opciones.$.value"]: modules.modules};
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];
        if(!opciones) return new HttpException("Gimansio no disponible", 500);
        let id = -1;
        opciones.forEach((element) => {
            if (element.key === 'modulesShow')
                id = element._id.toString();
        });
        
        if (id === -1) console.error("No se ecnontró modulesShow y se creará");// return new HttpException("ModulesShow option not found.", 503);
        
        try{
            const result = await dynamicModel.updateOne(
                { "opciones._id": id },
                { $set: updateFields }
            );
            if (result.modifiedCount === 0) {
                return new HttpException("No se pudo actualizar los módulos", 500);
            }
        } catch (err) { return new HttpException(err,500); }
        return { message: "Modules to show updated successfully" };
    }
    
    async setNumbersSociosMax(gynName: string, socios: number){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const updateFields = {["opciones.$.value"]: socios};
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];
        if(!opciones) return new HttpException("Gimansio no disponible", 500);
        let id = -1;
        opciones.forEach((element) => {
            if (element.key === 'numberSociosMax')
                id = element._id.toString();
        });
        
        if (id === -1) {
            existingDocument["opciones"].push( { key:"numberSociosMax", value: socios } );
            return await existingDocument.save();
        }
        const result = await dynamicModel.updateOne(
            { "opciones._id": id },
            { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
            return new HttpException("No se pudo actualizar el número de socios", 500);
        }
        return { message: "Socios number updated successfully" };
    }

    async setStatusSubscription(gynName: string, status: any){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const updateFields = {["opciones.$.value"]: status.status, ["opciones.$.startDate"]: status.startDate, ["opciones.$.endDate"]: status.endDate};
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];
        if(!opciones) return new HttpException("Gimansio no disponible", 500);
        let id = -1;
        opciones.forEach((element) => {
            if (element.key === 'statusSubscription')
                id = element._id.toString();
        });
        
        if (id === -1) {
            existingDocument["opciones"].push( { key:"statusSubscription", value: status.status, startDate:status.startDate, endDate: status.endDate } );
            return await existingDocument.save();
        }
        const result = await dynamicModel.updateOne(
            { "opciones._id": id },
            { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
            return new HttpException("No se pudo actualizar el status de la subscripción.", 500);
        }
        return { message: "Status updated successfully" };
    }

    async showErrorsClient( gynName: string, data: any ){
        const dynamicModel = await this.generateDynamicalModel(gynName, "opciones");
        const updateFields = {["opciones.$.value"]: data.message,["opciones.$.show"]: data.show};
        const existingDocument = await dynamicModel.findOne({ ["opciones"]: { $exists: true } });
        const opciones = existingDocument["opciones"];
        if(!opciones) return new HttpException("Gimansio no disponible", 500);
        let id = -1;
        opciones.forEach((element) => {
            if (element.key === 'showErrorsClient')
                id = element._id.toString();
        });
        
        if (id === -1) {
            existingDocument["opciones"].push( { key:"showErrorsClient", value: data.message, show: data.show } );
            return await existingDocument.save();
        }
        const result = await dynamicModel.updateOne(
            { "opciones._id": id },
            { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
            return new HttpException("No se pudo actualizar mensaje de la subscripción.", 500);
        }
        return { message: "Message to show updated successfully" };
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

    async deleteGym(gymName: string, data:any){
        try{
            const collections = await this.connection.db.listCollections().toArray();
            const collectionExists = collections.findIndex((col) => col.name === data.gym);
            if (collectionExists === -1) return new HttpException(`La colección "${data.gym}" no existe.`,404);

            await this.connection.db.dropCollection(data.gym);
            console.log(`Colección "${data.gym}" eliminada correctamente.`);
            return true;
        } catch (error) {
            console.error(`Error al eliminar la colección "${data.gym}":`, error);
            return new HttpException(error, 500);
        }
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