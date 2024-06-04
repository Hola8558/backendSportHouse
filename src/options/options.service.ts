import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Options } from "./schemas/options.schema";
import { Model } from "mongoose";
import { NumeroRutina } from "./dtos/numeroRutinas.dto";

@Injectable()
export class OptionsService {

    constructor(
        @InjectModel(Options.name) private optionsModel: Model<Options>
    ){}
    
    async cambiarNumeroRutinas(tel:NumeroRutina){
        const numeroRutinas = new this.optionsModel(tel);
        return numeroRutinas.save();
    }

    async getNumeroRutinas(){
        return await this.optionsModel.distinct('numeroRutinas');
    }
}