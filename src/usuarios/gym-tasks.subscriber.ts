// gym-tasks.subscriber.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PubSub } from '@google-cloud/pubsub';
import * as path from 'path';
import * as fs from 'fs';
import { UsuariosService } from './usuarios.service';
import { OptionsService } from 'src/options/options.service';
import { DuplicateElementError } from './error-manager';

interface taksInterface {
  endpoint: string;
  data: any
}

@Injectable()
export class GymTasksSubscriber implements OnModuleInit {
  private pubsub = new PubSub();

  constructor( private userService: UsuariosService,private optionsService: OptionsService ) {
    const credentialsPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
    const credentials = JSON.parse(credentialsContent);
    
    this.pubsub = new PubSub({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      credentials: {
          client_email: credentials.client_email,
          private_key:  credentials.private_key
        }
    });
  }

  async onModuleInit() {
    this.startSubscription();
  }

  private async startSubscription() {
    const subscription = this.pubsub.subscription('gym-creation-task-sub');
    subscription.on('message', async (message) => {
      const payload = JSON.parse(message.data.toString());
      try {for (const task of payload.tasks) await this.executeTask( task, payload.gymName );        
        message.ack();
      } catch (error) {
        if (error instanceof DuplicateElementError) {
          message.ack();
        } else {
          console.error(`Error procesando ${payload.gymName}:`, error);
          message.nack();
        }
      }
    });
  }

  private async executeTask( task: taksInterface, gymName : string ) {
    if( task.endpoint === 'createModels'){
      await this.userService[task.endpoint](gymName, task.data.collections)
    } else if (task.endpoint === 'createUser'){
      await this.userService[task.endpoint](gymName, task.data)
    } else {
      await this.optionsService[task.endpoint](gymName, task.data)
    }
  }
}