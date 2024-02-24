import { Device } from "src/devices/Schema/Device"

export interface passport {
  level: number
  number: number
}

export interface baseDataFace {
  device: string
}
export interface sendedDataFace {
  code: string
  data: {
    level: number
    volume: number
    vaqt: string
  }
}
export interface DeviceFace {
  _id: ObjectId;
  serie: string;
  device_privet_key: string;
  long: number;
  lat: number;
  region: ObjectId;
  owner: {
    _id: ObjectId;
    mobile_phone: string;
  };
  created_at: Date;
  updated_at: Date;
  name: string;
  created_at:Date
  updated_at:Date
  isWorking: boolean;
}

export interface ObjectId {
  // Define ObjectId properties here if necessary
  // For simplicity, assuming ObjectId is a string
  toString(): string;
}

interface DataItem {
  _id: string;
  serie: string;
  name: string;
  level: number;
  volume: number;
  date_in_ms: number;
  signal: string;
  device: Device;
}