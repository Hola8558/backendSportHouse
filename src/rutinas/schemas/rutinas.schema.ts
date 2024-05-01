import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Rutina {
    @Prop({required:true})
    name: string;
    @Prop({required:true})
    grupoMuscular: string;
    @Prop({required:true})
    ejercicios: [];
    @Prop({default : 0})
    favorites:number;
    @Prop({ required : false })
    peso?:number;

    @Prop({ required : false })
    conc?:number;
    @Prop({ required : false })
    iso?:number;
    @Prop({ required : false })
    exc?:number;

}

export const RutinaSchema = SchemaFactory.createForClass(Rutina);