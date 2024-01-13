import { promises, unlink } from 'fs'
import { join } from 'path'
import { passport } from '.'
export function gRN (min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
export function formatTimestamp (timestamp: number): string {
  if (isNaN(timestamp) || timestamp < 0) {
    return 'Invalid timestamp'
  }
  const date = new Date(timestamp)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
  }
  const formattedDate: string = date.toLocaleString('en-US', options)
  return formattedDate.replace(',', '')
}
// !
export function getCurrentDateTime (timestamp: number) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const separator = ' '
  return `${year}-${month}-${day}${separator}${hours}:${minutes}:${seconds}`
}

// ! Done 
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
  const arr = await read(`./src/_shared/passports/${serie}.json`)
  const random = Math.floor(Math.random() * (max - min + 1)) + min
  const { level, volume } = arr.find(el => el.level === random)
  return { level, volume, pressure: 961.8 }
}

export async function read (dir: string) {
  const data = await promises.readFile(dir, 'utf8')
  return data ? JSON.parse(data) : []
}
export async function write (dir: string, data: any[]) {
  const strinfdata = JSON.stringify(data)
  promises.writeFile(dir, strinfdata, { encoding: 'utf-8' })
}


export function deleteFile (folder: string, name: string): void {
  unlink(join(__dirname, '../../', folder, name), err => {
    if (err) {
      return
    }
  })
}
