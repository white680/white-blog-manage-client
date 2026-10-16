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

const pinia = createPinia()
const app = createApp(App)

// 将组件库的全局方法挂载到 Vue 实例上
app.config.globalProperties.$message = YkMessage
app.config.globalProperties.$notification = YkNotification




app
    .use(router)
    .use(Icon)
    .use(pinia)
    .mount('#app')
