import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import axios from 'axios'
import cors from 'koa2-cors'
import xmlParser from 'xml2json'
// import { stat } from 'fs';
const app = new Koa()
app.use(bodyParser())
app.use(cors({
  origin: function (ctx) {
    if (ctx.url === '/test') {
      return '*'
    }
    return 'http://localhost:8080'
  },
  exposeHeaders: ['www-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', "Access-Control-Allow-Headers", "set-cookie", "Cookie"]
}))
const router = new Router()

// app.use(async (ctx, next) => {
//   ctx.set('Access-Control-Allow-Origin', 'http://localhost:8080');
//   ctx.set('Access-Control-Allow-Methods', 'PUT,DELETE,POST,GET');
// })
let uuid = 'wfP35Z2MMQ=='
router.get('/wx/login/uuid', async (ctx:any) => {
  ctx.set('Access-Control-Allow-Origin', 'http://localhost:8080');
  let uuid_url ='https://login.wx2.qq.com/jslogin?appid=wx782c26e4c19acffb&redirect_uri=https%3A%2F%2Fwx2.qq.com%2Fcgi-bin%2Fmmwebwx-bin%2Fwebwxnewloginpage&fun=new&lang=zh_CN&_='+(new Date()).getTime()
  const resp = await axios.get(uuid_url)
  let code = resp.data.match(/code\s?=\s?(\d+)\s?;/)[1] - 0
  let uuid = resp.data.match(/uuid\s?=\s?"(.*)"\s?;/)[1]
  ctx.body = {
    code: code,
    uuid: uuid,
    qrcodeUrl: 'https://login.weixin.qq.com/qrcode/' + uuid
  }
})
router.get('/wx/login/qrcode', async (ctx:any) => {
  ctx.set('Access-Control-Allow-Origin', 'http://localhost:8080');
  ctx.set('Content-Type', 'image/jpeg');
  const resp = await axios.get('https://login.weixin.qq.com/qrcode/' + ctx.query.uuid, {
    // headers: {
    //   Accept: 'image/webp,image/apng,image/*,*/*;q=0.8'
    // }
  })
  // const qrcodeImageUrl = [
  //   'https://api.qrserver.com/v1/create-qr-code/?data=',
  //   encodeURIComponent(resp.data),
  // ].join('')
  ctx.body = {
    qrcodeUrl: 'https://login.weixin.qq.com/qrcode/' + ctx.query.uuid
  }
})

// window.code=200;window.redirect_uri="": 返回cookie, wxsid , wxloadtime, mm_lang=zh_CN; webwx_data_ticket; webwx_auth_ticket
// window.code=408:已扫码,未确认登录
// window.code=400:二维码失效重新扫码
router.get('/wx/login/qrcode/state', async (ctx:any) => {
  ctx.set('Access-Control-Allow-Origin', 'http://localhost:8080');
  let t = '-1111111'
  let _ = (new Date()).getTime()
  let uuid = ctx.query.uuid
  const resp = await axios.get(`https://login.wx2.qq.com/cgi-bin/mmwebwx-bin/login?loginicon=true&uuid=${uuid}&tip=0&r=${t}&=_=${_}`)
  ctx.body = resp.data || '获取登录二维码失败'
  let code = resp.data.match(/code\s?=\s?(\d+)\s?;/)[1] - 0
  let body:any = {
    code
  }
  if (code === 200) {
    let redirect_uri = resp.data.match(/redirect_uri\s?=\s?"(.*)"\s?;/)[1]
    let rres = await axios.get(redirect_uri, {
      withCredentials: true,
      maxRedirects: 0,
      validateStatus: function(status) {
        return status >= 200 && status <= 303
      }
    })
    console.log(rres.data)

    let cookie = rres.headers["set-cookie"]
    body.cookie = cookie
    let json = JSON.parse(xmlParser.toJson(rres.data))
    console.log('json', json)
    body.authData = json.error
  }
  ctx.body = body
})
router.post('/wx/init', async (ctx:any, next:any) => {
  let url = 'https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxinit?r=-1961479817'
  // wxsid, wxuin, cookie
  const resp = await axios.post(url, {
    BaseRequest: {
      DeviceID: '',
      Sid: ctx.request.body.wxsid,
      Uin: ctx.request.body.wxuin,
      Skey: ''
    }
  }, {
    headers: {
     "Cookie": ctx.request.body.cookie
    }
  })
  ctx.body = {
    code: 200,
    initData: resp.data
  }
})
router.post('/wx/contact', async (ctx:any) => {
  let skey = ctx.request.body.skey
  let r = (new Date()).getTime()
  const resp = await axios.get(`https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact?r=${r}&seq=0&skey=${skey}`, {
    headers: {
      "Cookie": ctx.request.body.cookie
    }
  })
  ctx.body = {
    code: resp.data.BaseResponse.Ret,
    errMsg: resp.data.BaseResponse.ErrMsg,
    memberCount: resp.data.MemberCount,
    memberList: resp.data.MemberList
  }
})
router.post('/wx/sendmsg', async (ctx:any) => {
  let t = (new Date()).getTime()
  let url = `https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxsendmsg?lang=zh_CN&pass_ticket=${ctx.request.body.pass_ticket}`

  let body = {
    BaseRequest: {
      DeviceID: 'e441551176',
      Sid: ctx.request.body.wxsid,
      Uin: ctx.request.body.wxuin,
      Skey: ctx.request.body.SKey
    },
    Msg: {
      // Type, FromUserName, ToUserName, Content
      ...ctx.request.body.Msg,
      ClientMsgId: t + '0217',
      LocalID: t + '0217'
    },
    Scene: 0
  }
  console.log('msgBody:',body)
  const resp = await axios.post(url, body, {
    headers: {
      'Cookie': ctx.request.body.cookie
    }
  })
  console.log('msgResponse', resp.data)
  ctx.body = resp.data
})
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000)

console.log('server running on port 3000')
