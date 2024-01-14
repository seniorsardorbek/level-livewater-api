import { promises, unlink } from "fs"
import { passport } from ".."
import { join } from "path"
import * as XLSX from 'xlsx';

export function convertArrayToJSON (inputArray) {
    inputArray.shift()
    const result: passport[] = inputArray.map(([level, volume]) => ({
      level: parseInt(level),
      volume: parseFloat(volume),
    }))
    return result
  }
  export async function getDataFromDevice (
    min: number,
    max: number,
    serie: string
  ) {
    const arr = await read(`./passports/${serie}.json`)
    const random = Math.floor(Math.random() * (max - min + 1)) + min
    const { level, volume } = arr.find(el => el.level === random)
    console.log({ level, volume, pressure: 961.8 });
    return { level, volume, pressure: 961.8 }
  }
  
  export async function read (dir: string) {
    const data = await promises.readFile(dir, 'utf8')
    return data ? JSON.parse(data) : []
  }
  export async function write (dir: string, data: any[]) {
    const stringData = JSON.stringify(data)
    promises.writeFile(dir, stringData, { encoding: 'utf-8' })
  }
  
  export function deleteFile (folder: string, name: string): void {
    unlink(join(__dirname, '../../../', folder, name), err => {
      if (err) {
        return
      }
    })
  }

  export function xlsxToArray (filePath: string) {
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    return XLSX.utils.sheet_to_json(sheet, { header: 1 })
  }