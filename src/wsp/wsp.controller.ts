import { Controller, Post, Body, ValidationPipe, Put, Get, Delete, Param } from '@nestjs/common';
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import * as fs from 'fs';
import * as qrcode from 'qrcode';
import * as fsProm from 'fs/promises';
import * as fsExt from 'fs-extra';
import { url } from 'inspector';

@Controller('api')
export class WspController {

    public clientsIds = [];
    public clients = new Map(); // Store multiple client instances
    public qrCallbacks = new Map(); // Store QR callbacks for each client
    //const upload = multer({ storage: storage });
  public pathWsp = '/../../.wwebjs_auth';
  //public pathWsp = './.wwebjs_auth';
public initializeClient = async (sessionId, res = null) => {
  if (this.clients.has(sessionId)) {
    let existingData = this.clients.get(sessionId);
    if (existingData.client && existingData.client.isReady) {
      return;
    }
  }

  this.clients.set(sessionId, { isInitializing: true });
  let client = await this.clients.get(sessionId).client;
  
  if (!client)
  client = new Client({
    authStrategy: new LocalAuth({ 
      clientId: sessionId,
      dataPath: this.pathWsp
     }),
    
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 120000
    },
    webVersionCache: {
      type: "none",
    },
  });
  
  //remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",

  client.on('qr', async qr => {
    const callback = await this.qrCallbacks.get(sessionId);
    if (callback) {
      callback(qr);
    }
  });
  
  client.on('ready', () => {
    console.log(`Client ${sessionId} is ready!`);
    this.qrCallbacks.delete(sessionId);
    this.clients.set(sessionId, { client, isInitializing: false });
    if (res && !res.headersSent) {
      res.status(200).send({ success: true, message: 'Session is ready.' });
    }
  });
  
  client.on('authenticated', () => {
    console.log(`Client ${sessionId} authenticated`);
    this.clientsIds.push(sessionId)
  });
  
  client.on('auth_failure', msg => {
    console.error(`Authentication failed for ${sessionId}:`, msg);
    this.clients.delete(sessionId);
    if (res && !res.headersSent) {
      res.status(500).send({ success: false, error: 'Authentication failed.' });
    }
  });

  client.on('disconnected', async (reason) => {
    console.log(`Client ${sessionId} disconnected:`, reason);
    client.destroy();
    this.clients.delete(sessionId);
    setTimeout(() => {
      this.deleteDirectory(`${this.pathWsp}/session-${sessionId}`);
    }, 1000);
    for (let i = 0; i < this.clientsIds.length; i++){
      if (this.clientsIds[i] === sessionId)
        this.clientsIds.splice(i,1);
    }
  });
  try {
    await client.initialize();
  } catch (e) {
    console.error(`Error initializing client ${sessionId}:`, e);
    this.clients.delete(sessionId);
    if (res && !res.headersSent) {
      res.status(500).send({ success: false, error: 'Initialization failed.' });
    }
  }
};

    async deleteDirectory(directory) {
  try {
      await fsExt.remove(directory);
      console.log(`Directory ${directory} removed successfully`);
      
      console.log('Session Removed');
    } catch (err) {
      console.error('Something wrong happened removing the session', err);
  }
}

    @Delete('/deleteAllSessions')
    deleteAllSession(){
        if (!fs.existsSync(this.pathWsp)) {
            //res.status(404).send({success: false, message: "No existe ya"})
            return {success: false, message: "No existe ya"}
        }
        try{
            this.deleteDirectory(this.pathWsp);
        }catch(e){
            //res.status(500).send();
            return {msg: e.message};
        }  
    }

    @Get('/qr/:sessionId')
    getQr( @Param('sessionId') sessionId : string ){
        console.log(`Getting Qr for ${sessionId}`);
        if (this.clients.has(sessionId) && this.clients.get(sessionId).client && this.clients.get(sessionId).client.info) {
            //return res.status(200).send({ success: true, message: 'Ya existe una sesión iniciada.' });
            return { success: true, message: 'Ya existe una sesión iniciada.' }
        }

        this.initializeClient(sessionId);

        return new Promise((resolve, reject) => {
            this.qrCallbacks.set(sessionId, async (qr) => {
              try {
                const url = await qrcode.toDataURL(qr);
                if (url) {
                  resolve({ success: true, message: 'QR code generated.', qr: url });
                }
              } catch (err) {
                reject({ success: false, error: err.message });
              }
            });

            setTimeout(() => {
                return { success: false, message: 'QR code scan timeout. Please try again.' }
            //if (!res.headersSent) {
            //    res.status(408).send({ success: false, message: 'QR code scan timeout. Please try again.' });
            //}
            }, 60000); // Timeout after 60 seconds

        }).finally(() => {
            this.qrCallbacks.delete(sessionId);
          });
        }

    @Get('/login/:sessionId')
    async login( @Param('sessionId') sessionId : string ){
        console.log(`To Loggin ${sessionId}`);

        const directoryPath = this.pathWsp;
        try {
            await fsProm.access(directoryPath);
        } catch (err) {
            return { success: false, message: "No existe esta sesión" }// res.status(404).send({ success: false, message: "No existe esta sesión" });
        }
        
        const items = fs.readdirSync(directoryPath);
        let valid = false;
        items.forEach((x)=> {
            if (x === sessionId) {
            valid = true;
            return
            }
        })

        if (!valid) return {success:false, message: "No existe esta carpeta de secion"} //res.status(404).send({success:false, message: "No existe esta carpeta de secion"})

        for (let i = 0; i < this.clientsIds.length; i++){
            if (this.clientsIds[i] === sessionId)
            return {success:true, message: 'Concexión con wsp exitosa.'} // res.status(200).send({success:true, message: 'Concexión con wsp exitosa.'});
        }

        this.initializeClient(sessionId);
    }

    @Post('/message/:sessionId')
    async sendMessage( @Param('sessionId') sessionId:string, @Body() body :any ){
        const { message, number, file, nameFile } = body;
        const clientData = this.clients.get(sessionId);
        if (!clientData || !clientData.client || !clientData.client.info) {
            return { success: false, message: 'No existe sesión activa.' }// res.status(400).send({ success: false, message: 'No existe sesión activa.' });
        }

        if (!message && !file) {
            return { error: 'Message body or file is required' }// res.status(400).send();
        }

        const recipient = `521${number}@c.us`;

        console.log(`Sending message to: ${recipient}`);
        try {
            let response;
            if (file) {
            const base64Data = file.replace(/^data:application\/pdf;base64,/, '');

            // Buffer the base64 string
            const pdfBuffer = Buffer.from(base64Data, 'base64');
            
            // Write the buffer to a file
            const filePath = nameFile;
            fs.writeFileSync(filePath, pdfBuffer);
            const media = MessageMedia.fromFilePath(filePath);
            response = await clientData.client.sendMessage(recipient, media, { caption: message });
            } else {
            response = await clientData.client.sendMessage(recipient, message);
            }

            fs.unlink(nameFile, (err) => {
            if (err) {
                console.error(`Error deleting file ${nameFile}:`, err);
            } else {
                console.log(`File ${nameFile} deleted successfully.`);
            }
            });
            //console.log('Message sent:', response);
            return { success: true, response } //res.status(200).send({ success: true, response });
        } catch (err) {
            console.error('Message sending error', err);
            return { success: false, error: err.message } //res.status(500).send({ success: false, error: err.message });
        }
    }

    @Delete('/:sessionId')
deleteOneSession( @Param('sessionId') sessionId:string ){
  try{
    this.deleteDirectory(`${this.pathWsp}/${sessionId}`);
    for (let i = 0; i < this.clientsIds.length; i++){
      if (this.clientsIds[i] === sessionId)
        this.clientsIds.splice(i,1);
    }
    return {success:true} //res.status(200).send({success:true});
  }catch(e){
    return {msg: e.message} //res.status(500).send({msg: e.message});
  }
}
}