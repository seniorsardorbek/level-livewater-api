import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { ObjectId } from 'mongoose'

@Schema({
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Device {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  serie: string

  @Prop({
    type: String,
    required: true,
  })
  name: string

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  device_privet_key: string
  
  @Prop({
    type: String,
    required: true,
  })
  contractor: string

  @Prop({
    type: Number,
    required: true,
  })
  long: number

  @Prop({
    type: Number,
    required: true,
  })
  lat: number

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    required: true,
  })
  region: ObjectId
  @Prop({
    type: mongoose.Schema.Types.Boolean,
    default : true
  })
  isWorking: boolean

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  owner: ObjectId
}
export const DeviceSchema = SchemaFactory.createForClass(Device)
