import mongoose from 'mongoose'
export const dbAddr: string = process.env.DB_PORT_27017_TCP_ADDR || 'dome-db'
export const dbPort: string = process.env.DB_PORT_27017_TCP_PORT || '27017'
export const dbName: string = 'wx'
export const connection: any = mongoose.connect(`mongodb://${dbAddr}:${dbPort}/${dbName}`)
export const Schema: any = mongoose.Schema