import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Ejercicio {
    @Prop({required:true})
    nombre: string;
    @Prop({required:true})
    description: string;
    @Prop({required:true})
    url: string;
    @Prop({required:true})
    grupoMuscular:string;

}

export const EjercicioSchema = SchemaFactory.createForClass(Ejercicio);