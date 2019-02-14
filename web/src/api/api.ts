import axios from 'axios'

const getUuid = async () => {
  const uuidUrl = 'http://localhost:3000/wx/login/uuid'
  const resp = await axios.get(uuidUrl)
  return resp.data
}
const getQrcode = async (uuid: string) => {
  const qrcodeUrl = 'http://localhost:3000/wx/login/qrcode?uuid=' + uuid
  const resp = await axios.get(qrcodeUrl)
  return resp.data
}
const getQrcodeState = async (uuid: string) => {
  const qrcodeUrl = 'http://localhost:3000/wx/login/qrcode/state?uuid=' + uuid
  const resp = await axios.get(qrcodeUrl)
  return resp.data
}
const wxInit = async ({wxsid, wxuin, cookie}: any) => {
  const url = 'http://localhost:3000/wx/init'
  const resp = await axios.post(url, {
    wxsid,
    wxuin,
    cookie
  })
  return resp.data
}
const getContact = async ({skey, cookie}: any) => {
  const url = 'http://localhost:3000/wx/contact'
  const resp = await axios.post(url, {
    skey,
    cookie
  })
  return resp.data
}
const sendMsg = async (baseData: any, msgData: any) => {
  const url = 'http://localhost:3000/wx/sendmsg'
  const resp = await axios.post(url, {
    wxsid: baseData.wxsid,
    wxuin: baseData.wxuin,
    pass_ticket: baseData.pass_ticket,
    SKey: baseData.SKey,
    Msg: msgData,
    cookie: baseData.cookie
  })
  return resp.data
}
export default {
  getUuid,
  getQrcode,
  getQrcodeState,
  wxInit,
  getContact,
  sendMsg
}