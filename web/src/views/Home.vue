<template>
  <div class="home">
    <button @click="refresh">重新登录</button>
    <img alt="Vue logo" v-if="!isLogin" :src="qrcodeUrl">
    <!-- <div>
      <h1>消息框</h1>
      <p>To: {{To.NickName}}</p>
      <p>{{To.message}}</p>
      <button @click="sendTo(To)">发送</button>
    </div>
    <div v-for="(item, index) in contactList" :key="index">
      <p>UserName: {{item.UserName}}</p>
      <p>昵称: {{item.NickName}}</p>
      <p>备注: {{item.RemarkName||'--'}}</p>
      <button @click="select(item)">选择</button>
    </div> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component} from 'vue-property-decorator';
import api from '../api/api'
import Cache from '../service/cache'
@Component({
  components: {
  }
})
export default class Home extends Vue {
  qrcodeUrl: any = ''
  isLogin: boolean = false
  userInfo: any = {}
  initData: any = {}
  contactList: any = []
  To:any = {}
  loginInfo:any = {}
  authInfo:any = {}
  async mounted() {
    if (!Cache.get('wxIsLogin')) {
      this.refresh()
    } else {
      // this.userInfo = Cache.get('wxUserInfo')
      // this.loginInfo = Cache.get('wxLoginInfo')
      // this.authInfo = Cache.get('wxAuthInfo')
      this.$router.push('/about')
    }
  }
  select(item: any) {
    this.To = item
    this.To.message = item.NickName + '同志, 你好'
  }
  // async sendTo() {
  //   let resp = await api.sendMessage(this.baseData, {
  //     Type: 1,
  //     ToUserName: this.To.UserName,
  //     Content: 'hello, world'
  //   })
  // }
  async refresh() {
    this.isLogin = false
    Cache.set('wxIsLogin', false)
    const resp = await api.getUuid()
    if (resp.code === 200) {
      this.qrcodeUrl = resp.qrcodeUrl
      let loginInfo = {
        uuid: resp.uuid,
        qrcodeUrl: resp.qrcodeUrl
      }
      Cache.set('wxLoginInfo', loginInfo)
      this.pollQrcodeState()
    }
  }
  async pollQrcodeState() {
    let uuid = Cache.get('wxLoginInfo').uuid
    const resp = await api.getQrcodeState(uuid)
    if (resp.code === 200) {
      Cache.set('wxIsLogin', true)
      Cache.set('wxCookie', resp.cookie)
      Cache.set('wxAuthInfo', resp.authData)
      this.initWx()
      // setcookie
    } else if (resp.code === 400) {
      this.refresh()
    } else if (resp.code === 201 || resp.code === 408) {
      setTimeout(() => {
       this.pollQrcodeState()
      }, 1000);
    }
  }
  async initWx() {
    let resp:any = await api.wxInit({
      wxsid: Cache.get('wxAuthInfo').wxsid,
      wxuin: Cache.get('wxAuthInfo').wxuin,
      cookie: Cache.get('wxCookie')
    })
    if (resp.code === 200) {
      Cache.set('wxAuthInfo', {
        ...Cache.get('wxAuthInfo'),
        SKey: resp.initData.SKey,
        SyncKey: resp.initData.SyncKey
      })
      Cache.set('wxUserInfo', resp.initData.User)
      Cache.set('wxInitData', resp.initData)
      this.$router.push({path: '/about'})
    }
  }
}
</script>
