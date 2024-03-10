import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { EjercicioDto } from "./dtos/ejercicios.dto";
import { Ejercicio } from './schemas/ejercicios.schema';
import { EjercicioUpdateDto } from './dtos/ejercicios-update.dto';
import { RutinaDto } from './dtos/rutina.dto';
import { Rutina } from './schemas/rutinas.schema';

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

    async createRutina(rutina : RutinaDto){
        const createdRutina = new this.rutinaModel(rutina);
        createdRutina.save()
    }

    async findAllRutinas(){
        return this.rutinaModel.find().exec();
    }

    async findOneRutina(id:string){
        return this.rutinaModel.findById(id).exec();
    }

}