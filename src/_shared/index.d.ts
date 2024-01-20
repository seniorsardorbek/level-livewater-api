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
