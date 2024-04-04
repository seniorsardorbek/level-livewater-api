import { Injectable } from '@nestjs/common'
import * as mqtt from 'mqtt'

@Injectable()
export class MqttService {
  client: mqtt.MqttClient

  constructor () {
    this.client = mqtt.connect({
      host: 'livewater.uz',
      port: 1884,
      password: 'red24',
      username: 'water24',
    })

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker')
    })

    this.client.on('error', error => {
      console.error('MQTT client error:', error)
    })
  }

  sendMessage (topic: string): void {
    this.client.publish(
      topic,
      Buffer.from([0x01, 0x03, 0x00, 0x01, 0x00, 0x01, 0xd5, 0xca])
    )
  }

  subscribe (topic: string): void {
    this.client.subscribe(topic, err => {
      if (err) {
        console.error('Error subscribing to topic', err)
      } else {
        console.log('Subscribed to topic:', topic)
      }
    })
  }

  unsubscribe (topic: string): void {
    this.client.unsubscribe(topic, err => {
      if (err) {
        console.error('Error unsubscribing to topic', err)
      } else {
        console.log('Unubscribed to topic:', topic)
      }
    })
  }
}
