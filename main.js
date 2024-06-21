const express = require('express');
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const fsProm = require('fs').promises
const path = require('path');
const bodyParser = require('body-parser');

require('dotenv').config()

const app = express();
const router = express.Router();
// Aumentar el límite de tamaño permitido
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '/.wwebjs_auth');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

// Middleware
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use('/api', router);
app.use('/uploads', express.static('uploads'));

const clientsIds = [];
const clients = new Map(); // Store multiple client instances
const qrCallbacks = new Map(); // Store QR callbacks for each client
//const upload = multer({ storage: storage });

const initializeClient = async (sessionId, res = null) => {
  if (clients.has(sessionId)) {
    const existingData = clients.get(sessionId);
    if (existingData.client && existingData.client.isReady) {
      return;
    }
  }

  clients.set(sessionId, { isInitializing: true });
  let client = clients.get(sessionId).client;

  if (!client)
  client = new Client({
    authStrategy: new LocalAuth({ 
      clientId: sessionId,
      dataPath: '/.wwebjs_auth'
     }),
    
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000
    },
    webVersionCache: {
      type: "remote",
      remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
  });

  client.on('qr', qr => {
    const callback = qrCallbacks.get(sessionId);
    if (callback) {
      callback(qr);
    }
  });

  client.on('ready', () => {
    console.log(`Client ${sessionId} is ready!`);
    qrCallbacks.delete(sessionId);
    clients.set(sessionId, { client, isInitializing: false });
    if (res && !res.headersSent) {
      res.status(200).send({ success: true, message: 'Session is ready.' });
    }
  });
  client.on('authenticated', () => {
    console.log(`Client ${sessionId} authenticated`);
    clientsIds.push(sessionId)
  });
  
  client.on('auth_failure', msg => {
    console.error(`Authentication failed for ${sessionId}:`, msg);
    clients.delete(sessionId);
    if (res && !res.headersSent) {
      res.status(500).send({ success: false, error: 'Authentication failed.' });
    }
  });

  client.on('disconnected', async (reason) => {
    console.log(`Client ${sessionId} disconnected:`, reason);
    client.destroy();
    clients.delete(sessionId);
    setTimeout(() => {
      deleteDirectory(`/.wwebjs_auth/session-${sessionId}`);
    }, 1000);
    for (let i = 0; i < clientsIds.length; i++){
      if (clientsIds[i] === sessionId)
        clientsIds.splice(i,1);
    }
  });

  try {
    await client.initialize();
  } catch (e) {
    console.error(`Error initializing client ${sessionId}:`, e);
    clients.delete(sessionId);
    if (res && !res.headersSent) {
      res.status(500).send({ success: false, error: 'Initialization failed.' });
    }
  }
};

async function deleteDirectory(directory) {
  try {
      await fs.rm(directory, { recursive: true, force: true });
      console.log(`Directory ${directory} removed successfully`);
      
      console.log('Session Removed');
    } catch (err) {
      console.error('Something wrong happened removing the session', err);
  }
}

router.post('/deleteAllSessions', async (req, res) => {
  if (!fs.existsSync(`/.wwebjs_auth`)) {
    res.status(404).send({success: false, message: "No existe ya"})
  }
  try{
    deleteDirectory(`/.wwebjs_auth`);
    res.status(200).send({success:true});
  }catch(e){
    res.status(500).send({msg: e.message});
  }  
})

router.get('/qr/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  if (clients.has(sessionId) && clients.get(sessionId).client && clients.get(sessionId).client.info) {
    return res.status(200).send({ success: true, message: 'Ya existe una sesión iniciada.' });
  }

  initializeClient(sessionId, res);

  try {
    qrCallbacks.set(sessionId, async qr => {
      try {
        const url = await qrcode.toDataURL(qr);
        if (!res.headersSent) {
          res.status(200).send({ success: true, message: 'QR code generated.', qr: url });
        }
      } catch (err) {
        if (!res.headersSent) {
          res.status(500).send({ success: false, error: err.message });
        }
      }
    });

    setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).send({ success: false, message: 'QR code scan timeout. Please try again.' });
      }
    }, 60000); // Timeout after 60 seconds

  } catch (err) {
    qrCallbacks.delete(sessionId);
    if (!res.headersSent) {
      res.status(500).send({ success: false, error: err.message });
    }
  }
});

router.get('/login/:sessionId' , async (req, res) => {
  const { sessionId }  = req.params;
  console.log(`To Loggin ${sessionId}`);

  const directoryPath = './.wwebjs_auth';
  try {
    await fsProm.access(directoryPath);
} catch (err) {
    return res.status(404).send({ success: false, message: "No existe esta sesión" });
}
  
  const items = fs.readdirSync(directoryPath);
  let valid = false;
  items.forEach((x)=> {
    if (x === sessionId) {
      valid = true;
      return
    }
  })

  if (!valid) res.status(404).send({success:false, message: "No existe esta carpeta de secion"})

  for (let i = 0; i < clientsIds.length; i++){
    if (clientsIds[i] === sessionId)
      return res.status(200).send({success:true, message: 'Concexión con wsp exitosa.'});
  }

  initializeClient(sessionId, res);
})

router.post('/message/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const { message, number, file, nameFile } = req.body;
  const clientData = clients.get(sessionId);
  if (!clientData || !clientData.client || !clientData.client.info) {
    return res.status(400).send({ success: false, message: 'No existe sesión activa.' });
  }

  if (!message && !file) {
    return res.status(400).send({ error: 'Message body or file is required' });
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
    res.status(200).send({ success: true, response });
  } catch (err) {
    console.error('Message sending error', err);
    res.status(500).send({ success: false, error: err.message });
  }
});

router.delete('/:sessionId', async (req, res) =>{
  const { sessionId } = req.params;
  try{
    deleteDirectory(`/.wwebjs_auth/${sessionId}`);
    for (let i = 0; i < clientsIds.length; i++){
      if (clientsIds[i] === sessionId)
        clientsIds.splice(i,1);
    }
    res.status(200).send({success:true});
  }catch(e){
    res.status(500).send({msg: e.message});
  }
})
const PORT = process.env.PORTNODE;
app.listen(PORT, () => {
  console.log(`Server live on Port ${PORT}!`);
});