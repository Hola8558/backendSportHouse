import { Body, Controller, Get, Param, Post, Put, Res, UploadedFile, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { OptionsService } from "./options.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from 'express';

@Controller('options')
export class OptionsController {

    constructor(private optionsService : OptionsService){ }

    @Post(':gynName/wspId')
    async setWspId( @Param('gynName')gynName : string, @Body(new ValidationPipe()) id : number ){   
        return this.optionsService.setWspId( gynName, id );
    }

    @Post(':gynName/gymName')
    async setGymName( @Param('gynName')gynName : string, @Body(new ValidationPipe()) name : string ){   
        return this.optionsService.setGymName( gynName, name );
    }

    @Post(':gynName/gymImg')
    async setGymImg( @Param('gynName')gynName : string, @Body(new ValidationPipe()) img : string ){   
        return this.optionsService.setGymImg( gynName, img );
    }

    @Post(':gynName/gymFavicon')
    async setGymFavicon( @Param('gynName')gynName : string, @Body(new ValidationPipe()) favicon : string ){   
        return this.optionsService.setGymFavicon( gynName, favicon );
    }

    @Post(':gynName/modulesShow')
    async setmodulesShow( @Param('gynName')gynName : string, @Body(new ValidationPipe()) modules : {modules: string[]} ){   
        return this.optionsService.setmodulesShow( gynName, modules );
    }

    @Post(':gynName/deleteGymDef')
    async deleteGymDef( @Param('gynName')gynName : string, @Body(new ValidationPipe()) name : {name: string} ){
        return this.optionsService.deleteGymDef( gynName, name.name );
    }


    @Get(':gynName/wspId')
    async gwtSwspId( @Param('gynName')gynName : string ){
        return await this.optionsService.gwtSwspId( gynName );
    }

    @Get(':gynName/gymName')
    async gwtName( @Param('gynName')gynName : string ){   
        return this.optionsService.gwtName( gynName );
    }

    @Get(':gynName/gymImg')
    async gwtImg( @Param('gynName')gynName : string ){         
        return this.optionsService.gwtImg( gynName );
    }

    @Get(':gynName/gymFavicon')
    async gwtFavicon( @Param('gynName')gynName : string ){   
        return this.optionsService.gwtFavicon( gynName );
    }

    @Get(':gynName/modulesShow')
    async gwtmodulesShow( @Param('gynName')gynName : string ){   
        return this.optionsService.gwtmodulesShow( gynName );
    }

    @Get(':gynName/validGym')
    async gwtvalidGym( @Param('gynName')gynName : string ){
        return this.optionsService.gwtvalidGym( gynName );
    }

    @Get('getAllGymNames/admin')
    async getAllGymNames( ){   
        return this.optionsService.gwtAllGymNames();
    }

    @Get(':gynName/audioFile')
    async getAudioFile( @Param('gynName') gynName: string ) {
    return await this.optionsService.getAudioFile(gynName);
    //  //const audioFile = await this.optionsService.getAudioFile(gynName);
    /*   const res = {
        'Content-Type': audioFile.contentType,
        'Content-Disposition': `attachment; filename="${audioFile.filename}"`,
      }
    try {
      res.set();
      res.send(audioFile.data);
    } catch (error) {
      res.status(404).send(error.message);
    } */
    }

    //@Get(':gynName/audioFile')
    //async getAudioFile(@Param('gynName') gynName: string, @Res() res: Response) {
    //try {
    //    const audioFile = await this.optionsService.getAudioFile(gynName);
    //    res.setHeader('Content-Type', audioFile.contentType);
    //    res.setHeader('Content-Disposition', `attachment; filename="${audioFile.filename}"`);
    //    res.send(audioFile.data);
    //} catch (error) {
    //    res.status(404).send(error.message);
    //}
    //}


    @Put(':gynName/wspId')
    async updateWspId( @Param('gynName')gynName : string, @Body(new ValidationPipe()) id : number ){   
        return this.optionsService.updateWspId( gynName, id );
    }

    @Put(':gynName/gymName')
    async updateGymName( @Param('gynName')gynName : string, @Body(new ValidationPipe()) name : string ){   
        return this.optionsService.updateGymName( name, gynName );
    }

    @Put(':gynName/gymImg')
    async updateGymImg( @Param('gynName')gynName : string, @Body(new ValidationPipe()) img : string ){   
        return this.optionsService.updateGymImg( img, gynName );
    }

    @Put(':gynName/gymFavicon')
    async updateGymFavicon( @Param('gynName')gynName : string, @Body(new ValidationPipe()) favicon : string ){   
        return this.optionsService.updateGymFavicon( favicon, gynName );
    }

    @Put(':gynName/modulesShow')
    async modulesShow( @Param('gynName')gynName : string, @Body(new ValidationPipe()) modules : {modules:string[]} ){   
        return this.optionsService.updateModulesShow( modules.modules, gynName );
    }

    @Put(':gynName/changeAudio')
    @UseInterceptors(FileInterceptor('file'))
    async changeAudio( @Param('gynName')gynName : string, @UploadedFile() file: Express.Multer.File ){   
        return this.optionsService.changeAudio( file, gynName );
    }

}