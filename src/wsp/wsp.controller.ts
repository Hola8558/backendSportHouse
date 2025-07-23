import { Controller, Post, Body, ValidationPipe, Put, Get, Delete, Param, HttpException } from '@nestjs/common';
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
    private readonly pdFile = '.wsp‑pending.json';
    private pendingDeletes = new Set<string>();

    constructor() {
      this.loadPendingDeletes();
      this.cleanUpPendingDeletes();

       setInterval(() => this.retryPendingDeletes(), 5_000);
    }

    private async retryPendingDeletes() {
      for (const sessionId of this.pendingDeletes) {
        const path = `${this.pathWsp}/session-${sessionId}`;
        try {
          await this.deleteDirectory(path);
          console.log(`✔ Eliminada sesión pendiente: ${sessionId}`);
          this.pendingDeletes.delete(sessionId);
        } catch (err) {
          console.warn(`⏳ No se pudo eliminar ${sessionId} aún:`, err.message);
          // se vuelve a intentar en el próximo intervalo
        }
      }

      this.persistPendingDeletes(); // actualiza el JSON
    }
    
    public initializeClient = async (sessionId, res = null) => {
      if (this.clients.has(sessionId)) {
        let existingData = this.clients.get(sessionId);
        if (existingData.isInitializing || (existingData.client && existingData.client.isReady)) return;
      }

      this.clients.set(sessionId, { isInitializing: true });
      let client = await this.clients.get(sessionId).client;
      
      if (!client)
        client = new Client({
          authStrategy: new LocalAuth({ clientId: sessionId, dataPath: this.pathWsp }),
          puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'], timeout: 120000 },
          webVersionCache: { type: "none" }
        });

      client.once('qr', async qr => {
        const callback = await this.qrCallbacks.get(sessionId);
        if (callback) callback(qr);
      });

      client.once('ready', () => { console.log(`Client ${sessionId} is ready!`);
        this.qrCallbacks.delete(sessionId);
        this.clients.set(sessionId, {...this.clients.get(sessionId), client, isInitializing: true});
        if (res && !res.headersSent) res.status(200).send({ success: true, message: 'Session is ready.' });
      });
      client.once('authenticated', () => {
        console.log(`Client ${sessionId} authenticated`);
        this.clientsIds.push(sessionId)
      });

      client.on('disconnected', async (reason) => {
        console.log(`Client ${sessionId} disconnected:`, reason);
        this.closeSessionAndDeleteData(sessionId, client);
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
      const dirExists = await fsProm.access(directory).then(() => true).catch(() => false);

      if (!dirExists) {
        console.log(`Directory ${directory} does not exist. Skipping deletion.`);
        return; // Salir silenciosamente si no existe
      }

      try {
        const fd = fs.openSync(directory, 'r+'); // Intenta abrir (para forzar cierre)
        fs.closeSync(fd);
      } catch (err) {console.log(`No active file descriptors in ${directory}`);}

      await fsExt.remove(directory);
      console.log(`Directory ${directory} removed successfully`);

    } catch (err) {throw new Error(err.message)}
  }

  async deleteDirectoryWithRetries(path: string, retries = 5, delayMs = 2500) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await fs.promises.rm(path, { recursive: true, force: true });
        console.log(`Directory ${path} deleted successfully.`);
        return;
      } catch (err) {
        if (err.code === 'EBUSY' || err.code === 'EPERM') {
          console.warn(`Attempt ${attempt} failed. Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } else {
          console.error(`Unexpected error deleting directory:`, err);
          break; // no sigas intentando si no es un problema típico de lock
        }
      }
    }

    console.error(`Failed to delete directory ${path} after ${retries} attempts.`);
  }

  async closeSessionAndDeleteData(sessionId, client){
    await client.destroy();
    this.clients.delete(sessionId);
    await this.pendingDeletes.add(sessionId);
    this.persistPendingDeletes();
    this.clientsIds = this.clientsIds.filter(id => id !== sessionId);
  }

  private loadPendingDeletes() {
    if (fs.existsSync(this.pdFile)) {
      try {
        const arr = JSON.parse(fs.readFileSync(this.pdFile, 'utf8'));
        if (Array.isArray(arr)) arr.forEach(id => this.pendingDeletes.add(id));
      } catch { /* archivo corrupto → ignóralo */ }
    }
  }

  private persistPendingDeletes() {
    fs.writeFileSync(this.pdFile, JSON.stringify([...this.pendingDeletes]));
  }

  private async cleanUpPendingDeletes() {
    for (const sessionId of this.pendingDeletes) {
      const path = `${this.pathWsp}/session-${sessionId}`;
      await this.deleteDirectoryWithRetries(path);
      this.pendingDeletes.delete(sessionId);
      this.persistPendingDeletes();
    }
  }

  private async getNextAvailableSessionIndex(baseSessionId: string): Promise<number> {
    const items = fs.existsSync(this.pathWsp) ? fs.readdirSync(this.pathWsp) : [];
    const regex = new RegExp(`^session-${baseSessionId}-(\\d+)$`);
    let maxIndex = 0;
    for (const item of items) {
      const match = item.match(regex);
      if (match) {
        const index = parseInt(match[1]);
        if (index > maxIndex) maxIndex = index;
      }
    }
    return maxIndex + 1;
  }

    @Delete('/deleteAllSessions')
    deleteAllSession(){
        if (!fs.existsSync(this.pathWsp)) return {success: false, message: "No existe ya"};

        try{ this.deleteDirectory(this.pathWsp);
        }catch(e) {return {msg: e.message};}
    }

    @Get('/qr/:sessionId')
    async getQr( @Param('sessionId') baseSessionId : string ){
      const sessionIndex = await this.getNextAvailableSessionIndex(baseSessionId);
      const sessionId = `${baseSessionId}-${sessionIndex}`;
      console.log(`Getting QR for ${sessionId}`);
        
      if (this.clients.has(sessionId)) {
        const client = this.clients.get(sessionId).client;
        if (client && client.info) return { success: true, message: 'Sesión ya iniciada' };
      }

      this.initializeClient(sessionId);

      return new Promise((resolve, reject) => {
          this.qrCallbacks.set(sessionId, async (qr) => {
            try {
              const url = await qrcode.toDataURL(qr);
              resolve({ success: true, message: 'QR code generated.', qr: url });
            } catch (err) {
              reject({ success: false, error: err.message });
            }
          });
          setTimeout(() => this.qrCallbacks.delete(sessionId), 60000);
      });
    }

    @Get('/login/:sessionId')
    async login( @Param('sessionId') baseSessionId : string ){
      const items = fs.existsSync(this.pathWsp) ? fs.readdirSync(this.pathWsp) : [];
      const sessionIndex = await this.getNextAvailableSessionIndex(baseSessionId);
      this.deletePreviousSessions(items, baseSessionId, sessionIndex);
      const matching = items.filter(dir => dir.startsWith(`session-${baseSessionId}-${sessionIndex-1}`) && ![...this.pendingDeletes].includes(dir.replace('session-', '')));

      if (matching.length === 0) throw new HttpException('No existe esta carpeta de sesión.', 404);

      // Buscar el más reciente
      const sessionId = matching.sort().pop().replace('session-', '');
      if (this.clientsIds.includes(sessionId)) return { status: 'active' };

      this.initializeClient(sessionId);
      return { status: 'pending' };
    }

    async deletePreviousSessions(items, baseSessionId, sessionIndex){
      const previousSessions = items.filter(dir =>
          dir.startsWith(`session-${baseSessionId}-`) &&
          !dir.endsWith(`-${sessionIndex}`)
        ).map(dir => dir.replace('session-', ''));

      // 🧹 2. Marcar para eliminación si no están ya en pendingDeletes
      for (const oldSessionId of previousSessions) {
        if (!this.pendingDeletes.has(oldSessionId)) {
          console.log(`🔴 Agregando sesión previa a eliminación: ${oldSessionId}`);
          await this.pendingDeletes.add(oldSessionId);
        }
      }
      this.persistPendingDeletes();
    }

    @Post('/message/:sessionId')
    async sendMessage( @Param('sessionId') baseSessionId:string, @Body() body :any ){
        const { message, number, file, nameFile } = body;
        const sessionIndex = await this.getNextAvailableSessionIndex(baseSessionId);
        const clientData = this.clients.get(`${baseSessionId}-${sessionIndex-1}`);
        if (!clientData || !clientData.client || !clientData.client.info) return new HttpException("No existe sesión activa.", 401);

        if (!message && !file) return new HttpException("Message body or file is required", 403);

        const recipient = `${number}@c.us`;
        
        try {
            if (file) {
              const base64Data = file.replace(/^data:application\/pdf;base64,/, '');
              const media = new MessageMedia('application/pdf', base64Data, nameFile);
              await clientData.client.sendMessage(recipient, media, {
                caption: message,
              });
            } else {
              await clientData.client.sendMessage(recipient, message);
            }
            return { success: true };
        } catch (err) {
            console.error('Message sending error', err);
            return new HttpException(err.message, 500);
        }
    }

    @Delete('/:sessionId')
    async deleteOneSession(@Param('sessionId') sessionId: string) {
      try {
        const clientData = this.clients.get(sessionId);
        if (!clientData) throw new Error("Client not found.");

        this.closeSessionAndDeleteData(sessionId, clientData.client);
        return { success: true, message: 'Scheduled for deletion' };
      } catch (e) {
        console.error(e);
        return { success: false, message: e.message };
      }
    }
}