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