import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class AppService {
  constructor (@Inject("COMMUNACATION")private readonly communicationClient : ClientProxy){}
  getHello(): string {
   
    return 'Hey, Whats up, Bro!'
  }
  
}

