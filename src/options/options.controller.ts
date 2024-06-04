import { Body, Controller, Get, Post, ValidationPipe } from "@nestjs/common";
import { OptionsService } from "./options.service";
import { NumeroRutina } from "./dtos/numeroRutinas.dto";

@Controller('options')
export class OptionsController {

    constructor(private optionsService : OptionsService){ }

    @Post('cambiarNumeroRutinas')
    async cambiarNumeroRutinas( @Body(new ValidationPipe()) tel : NumeroRutina ){   
        return this.optionsService.cambiarNumeroRutinas(tel);
    }

    @Get('getNumeroRutinas')
    async getNumeroRutinas(){
        return await this.optionsService.getNumeroRutinas();
    }

}