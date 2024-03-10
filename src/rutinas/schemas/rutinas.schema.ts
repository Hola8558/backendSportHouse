import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Rutina {
    @Prop({required:true})
    name: string;
    @Prop({required:true})
    grupoMuscular: string;
    @Prop({required:true})
    ejercicios: [];

}

export const RutinaSchema = SchemaFactory.createForClass(Rutina);