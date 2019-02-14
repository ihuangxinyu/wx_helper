<template>
  <div class="about">
    <p class="ta-l">当前登录:{{userInfo.NickName}}</p>
    <div class="msg-box">
      <span class="label va-m">消息内容:</span>
      <!-- <input type="text" v-model="dialog.msgContent"> -->
      <textarea class="content va-m" name="" id="" cols="30" rows="1" v-model="dialog.msgContent"></textarea>
      <button class="va-m" @click="sendGroupMsg()">点击发送</button>
    </div>
    <table class="member-list">
      <col class="col-checkbox">
      <col class="col-nickname">
      <col class="col-remark">
      <!-- <col class="col-operation"> -->
      <tr class="">
        <td colspan="3">好友列表(共{{contactList.length}}位)</td>
      </tr>
      <tr class="table-head title">
        <td>
          <!-- 好友列表(共{{contactList.length}}位) -->
          <!-- <span class="checkbox"></span> -->
        </td>
        <td>昵称</td>
        <td>备注</td>
        <!-- <td>操作</td> -->
      </tr>
      <tr :class="{'selected': item.selected}" v-for="(item, index) in contactList" :key="index">
        <td class=""><span class="checkbox" :class="{'active': item.selected}" @click="selectMember(item,index)"></span></td>
        <td @click="selectMember(item,index)">{{item.NickName}}</td>
        <td @click="selectMember(item,index)">{{item.RemarkName}}</td>
        <!-- <td>{{item.Sex}}</td>
        <td>{{item.ContactFlag}}</td>
        <td>{{item.SnsFlag}}</td>
        <td>{{item.VerifyFlag}}</td> -->
        <!-- <td class="td-operation">
          <button @click="openPrefixBox(item)">编辑称呼</button>
          <button @click="openMsgBox('single', item)">发消息</button>
        </td> -->
      </tr>
    </table>
        <table class="selected-list">
      <col class="col-nickname">
      <col class="col-prefix">
      <col class="col-msg">

      <tr class="">
        <td colspan="2">
        已选好友 {{dialog.memberList && dialog.memberList.length}}
        </td>
      </tr>
      <tr class="table-head title">
        <td>昵称</td>
        <td>消息前缀称呼</td>
      </tr>
      <tr v-for="(item, index) in dialog.memberList" :key="index">
        <td>{{item.NickName}}</td>
        <td>
          <input type="text" v-model="item.prefix">
        </td>
      </tr>
    </table>
    <!-- <div class="dialog" v-show="prefixBox.visible">
      <p>{{prefixBox.NickName}}</p>
      前缀称呼:
      <input type="text" v-model="prefixBox.prefix">
      <button @click="savePrefix(prefixBox.UserName, prefixBox.prefix)">保存备注</button>
      <button @click="prefixBox.visible=false">关闭</button>
    </div>
    <div class="dialog" v-show="dialog.visible">
      <h1 v-show="dialog.type==='single'">发送消息 To: {{dialog.member.NickName}}</h1>
      <div v-show="dialog.type==='multiple'">
        <span class="label">群发对象:</span>
        <div class="content">
          <span v-for="(item, index) in dialog.memberList" :key="index">{{item.NickName}}</span>
        </div>
      </div>
      <div v-show="dialog.type==='multiple'">
        <span class="label">前缀称呼:</span>
        <div class="content">
          <span class="checkbox" :class="{'active':dialog.nameType==='NickName'}" @click="dialog.nameType==='NickName'"></span>昵称
          <span class="checkbox" :class="{'active':dialog.nameType==='RemarkName'}" @click="dialog.nameType==='RemarkName'"></span>备注
          <span class="checkbox" :class="{'active':dialog.nameType==='HoneyName'}" @click="dialog.nameType==='HoneyName'"></span>称呼

        </div>
      </div>
      <div>
      </div>
      <div>
        <span class="label">消息内容:</span>
        <textarea class="content" name="" id="" cols="30" rows="2" v-model="dialog.msgContent"></textarea>
      </div>
      <div class="btns">
        <button v-show="dialog.type==='single'" @click="sendMsg(dialog.member.UserName, dialog.msgContent)">发送</button>
        <button v-show="dialog.type==='multiple'" @click="sendGroupMsg()">群发</button>
        <button @click="dialog.visible=false">关闭</button>
      </div>
    </div> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component} from 'vue-property-decorator';
import api from '../api/api'
import Cache from '../service/cache'
import { config } from '@vue/test-utils';
@Component({
  components: {
  }
})
export default class About extends Vue {
  userInfo: any = {}
  contactList: any = []
  dialog: any = {
    type: 'single',
    visible: false,
    msgContent: '',
    member: {}
  }
  userRemarkMap: any = {}
  async mounted() {
    if (!Cache.get('wxIsLogin')) {
      this.$router.push({path: '/'})
    } else {
      this.userInfo = Cache.get('wxUserInfo')
      this.getContactList()
    }
  }
  async getContactList() {
    const resp = await api.getContact({
      skey: Cache.get('wxAuthInfo').SKey,
      cookie: Cache.get('wxCookie')
    })
    if (resp.code === 0) {
      resp.memberList.forEach(item => {
        item.prefix = item.RemarkName || item.NickName
      })
      this.contactList = resp.memberList.filter((item: any) => item.VerifyFlag === 0)
      console.log(this.contactList)
    } else {
      Cache.set('wxIsLogin', false)
      this.$router.push('/')
    }
  }
  selectMember(item, index) {
    item.selected = !item.selected
    this.$set(this.contactList, index, item)
    this.dialog.memberList = this.contactList.filter((item:any) => item.selected === true)
  }
  prefixBox: any = {
    visible: false,
    prefix: ''
  }
  openPrefixBox(item) {
    this.prefixBox.visible = true
    this.prefixBox.NickName = item.NickName
    this.prefixBox.UserName = item.UserName
    this.prefixBox.prefix = item.prefixName
  }
  savePrefix(UserName, prefix) {
    let remarkMap = Cache.get('wxRemarkMap') || {}
    remarkMap[UserName] = prefix
    Cache.set('wxRemarkMap', remarkMap)
    this.prefixBox.visible = false
    this.getContactList()
  }
  openMsgBox(type, item?:any) {
    this.dialog.type = type
    this.dialog.visible = true

  }
  async sendGroupMsg() {
    let r = window.confirm(`您确定要向已选的${this.dialog.member&&this.dialog.memberList.length}位好友发送消息"${this.dialog.msgContent}"?`)
    if (r) {
      this.dialog.memberList.forEach((m:any) => {
        let msg = m.prefix + this.dialog.msgContent
        this.sendMsg(m.UserName, msg)
      });
    }
  }
  async sendMsg(ToUserName:any, Content:any) {
    const resp = await api.sendMsg({
      wxsid: Cache.get('wxAuthInfo').wxsid,
      wxuin: Cache.get('wxAuthInfo').wxuin,
      SKey: Cache.get('wxAuthInfo').SKey,
      pass_ticket: Cache.get('wxAuthInfo').pass_ticket,
      cookie: Cache.get('wxCookie')
    }, {
      Type: 1,
      FromUserName: Cache.get('wxUserInfo').UserName,
      ToUserName,
      Content
    })
  }
}
</script>
<style lang="stylus">
input
  line-height 28px
  height 28px
  font-size 14px
  &:focus
    box-shadow none
    outline none
    border 1px solid blue
.ta-l
  text-align left
.va-m
  vertical-align middle
// .col-checkbox
//   width 30px
//   text-align center
// .col-nickname
//   width 200px
//   text-align left
// .col-remark
//   width 200px
//   text-align left
// .col-prefix
//   width 200px
//   text-align left
// .col-operation
//   text-align right
// .td-operation
//   padding-right 20px
//   button
//     margin 0 10px
.checkbox
  display inline-block
  width 14px
  height 14px
  border 1px solid #ccc
  border-radius 4px
  cursor pointer
  &.active
    background blue
.msg-box
  text-align right
  margin-bottom 20px
  padding-right 20px
  button
    margin-left 20px

.member-list
.selected-list
  border-collapse collapse
  tr
    border 1px solid #ddd
    line-height 40px
.member-list
  width 60%
  float left
.selected-list
  width 33%
  float right
.nickname {
  width 200px
  text-align left
}
tr.title {
  line-height 32px
}
tr.table-head
  border-bottom 1px solid #ccc
  background #eee
tr.selected
  background #f7f9fc
.remark
  width 100px
  text-align left

.dialog
  position fixed
  z-index 10
  width 500px
  height 300px
  top 200px
  left 200px
  padding 30px
  border 1px solid #ccc
  background #fff
  border-radius 5px
  text-align left
  .label
    display inline-block
    width 100px
    text-align right
    margin-right 10px
    vertical-align top
  .content
    margin-bottom 20px
    display inline-block
  .btns
    padding-left 110px
</style>

