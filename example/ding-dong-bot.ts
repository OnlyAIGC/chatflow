#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
/* eslint-disable sort-keys */
import 'dotenv/config.js'
import {
  WechatyBuilder,
} from 'wechaty'

import {
  ChatFlow,
  getBotOps,
  logForm,
  // LarkDB,
  GroupMaster,
  GroupMasterConfig,
  init,
} from '../src/chatflow.js'

const main = async () => {

  // 从环境变量中获取配置信息, 在环境变量中已经配置了以下信息或者直接赋值
  const WECHATY_PUPPET = process.env['WECHATY_PUPPET']
  const WECHATY_TOKEN = process.env['WECHATY_TOKEN']
  const VIKA_SPACE_ID = process.env['VIKA_SPACE_ID']
  const VIKA_TOKEN = process.env['VIKA_TOKEN']
  const ADMINROOM_ADMINROOMTOPIC = process.env['ADMINROOM_ADMINROOMTOPIC'] // 管理群的topic，可选

  // 构建wechaty机器人
  const ops = getBotOps(WECHATY_PUPPET, WECHATY_TOKEN) // 获取wechaty配置信息
  const bot = WechatyBuilder.build(ops)

  // 初始化检查数据库表，如果不存在则创建
  try {
    await init({
      spaceId: VIKA_SPACE_ID,
      token: VIKA_TOKEN,
    })
  } catch (e) {
    logForm('初始化检查失败：' + JSON.stringify(e))
  }

  // 使用Lark
  // await LarkDB.init({
  //   appId: process.env['LARK_APP_ID'],
  //   appSecret: process.env['LARK_APP_SECRET'],
  //   appToken: process.env['LARK_BITABLE_APP_TOKEN'],
  //   userMobile: process.env['LARK_APP_USER_MOBILE'],
  // })

  // 如果配置了群管理秘书，则启动群管理秘书，这是一个探索性功能，暂未开放，可以忽略
  if (process.env['GROUP_MASTER_ENDPOINT']) {
    const configGroupMaster: GroupMasterConfig = {
      WX_KEY:process.env['GROUP_MASTER_WX_KEY'] || '',
      MQTT_ENDPOINT:process.env['GROUP_MASTER_MQTT_ENDPOINT'] || '',
      MQTT_USERNAME:process.env['GROUP_MASTER_MQTT_USERNAME'] || '',
      MQTT_PASSWORD:process.env['GROUP_MASTER_MQTT_PASSWORD'] || '',
      MQTT_PORT:Number(process.env['GROUP_MASTER_MQTT_PORT'] || '1883'),
      HOST:process.env['GROUP_MASTER_ENDPOINT'] || '',
    }
    bot.use(GroupMaster(configGroupMaster))
  }

  // 启用ChatFlow插件
  bot.use(ChatFlow({
    spaceId: VIKA_SPACE_ID,
    token: VIKA_TOKEN,
    adminRoomTopic: ADMINROOM_ADMINROOMTOPIC,
  }))

  // 启动机器人
  bot.start()
    .then(() => logForm('1. 机器人启动，如出现二维码，请使用微信扫码登录\n\n2. 如果已经登录成功，则不会显示二维码\n\n3. 如未能成功登录访问 https://www.yuque.com/atorber/chatflow/ibnui5v8mob11d70 查看常见问题解决方法'))
    .catch((e: any) => logForm('机器人运行异常：' + JSON.stringify(e)))
}

void main()
