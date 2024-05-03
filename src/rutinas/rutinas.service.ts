import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { EjercicioDto } from "./dtos/ejercicios.dto";
import { Ejercicio } from './schemas/ejercicios.schema';
import { EjercicioUpdateDto } from './dtos/ejercicios-update.dto';
import { RutinaDto, rutinaUpdateDto } from './dtos/rutina.dto';
import { Rutina } from './schemas/rutinas.schema';
import { rutinasDTO } from 'src/clientes/dtos/update-client.dto';

@Injectable()
export class rutinasService {

    constructor( @InjectModel(Ejercicio.name)private ejercicioModel: Model<Ejercicio>, @InjectModel(Rutina.name)private rutinaModel : Model<Rutina> ){}


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

    async deleteEjercicio ( id : string ){
        return this.ejercicioModel.findByIdAndDelete(id).exec();
    }

    /** RUTINAS */

    async createRutina(rutina: any): Promise<string> {
        const savedRutina = await this.rutinaModel.create(rutina);
        return savedRutina._id.toString();
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

    async deleteRutina ( id : string ){
        return this.rutinaModel.findByIdAndDelete(id).exec();
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