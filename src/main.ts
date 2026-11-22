// 应用入口：注册路由、Pinia、Yike UI 图标及全局消息方法。
import { createApp } from 'vue'

import App from './App.vue'

// 引入组件库全局样式
import '@yike-design/ui/es/index.less'
import Icon from '@yike-design/ui/es/components/svg-icon'
import './style.less'
import { YkMessage, YkNotification } from '@yike-design/ui'

// 路由
import router from './router/index'

// pinia
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

// 将组件库的全局方法挂载到 Vue 实例上
app.config.globalProperties.$message = YkMessage
app.config.globalProperties.$notification = YkNotification




app.use(Icon)
    .use(pinia)
    .use(router)
    .mount('#app')
