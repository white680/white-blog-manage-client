// 路由表：后台页面共用主布局，文章和图库编辑页使用独立路由。
import { createWebHistory, createRouter } from 'vue-router'
import {useUserStore} from '../store/user.ts'


const routes = [
    {
        path: '/',
        name: 'home',
        redirect: '/overview',
        meta: { requiresAuth: true },
        component: () => import('../views/IndexView.vue'),
        children: [
            {
                path: '/overview',
                component: () => import('../views/OverView.vue')
            },
            {
                path: '/localfile',
                component: () => import('../views/FileView.vue')
            },
            {
                path: '/article',
                component: () => import('../views/ArticleView.vue')
            },
            {
                path: '/diary',
                component: () => import('../views/DiaryView.vue')
            },
            {
                path: '/gallery',
                component: () => import('../views/GalleryView.vue')
            },
            {
                path: '/setting',
                component: () => import('../views/SettingView.vue')
            },

        ]
    },
    {
        path: '/editgallery',
        meta: { requiresAuth: true },
        component: () => import('../views/EditGallery.vue')
    },
    // 新建和编辑文章共用页面，编辑时通过 ?id= 读取 mock 数据
    {
        path: '/editarticle',
        meta: { requiresAuth: true },
        component: () => import('../views/EditArticle.vue')
    },
    // 登录页面
    {
        path: '/login',
        component: () => import('../views/Login.vue'),
        // 添加标记，让App根据路由决定是否显示导航
        meta: { hideHeader: true }
    },
    // 注册页面
    {
        path: '/register',
        component: () => import('../views/Register.vue'),
        // 添加标记，让App根据路由决定是否显示导航
        meta: { hideHeader: true }
    },
    // 独立错误页：地址不存在时统一跳转到这里
    {
        path: '/errorinfo',
        name: 'errorinfo',
        component: () => import('../views/404.vue'),
        meta: { hideHeader: true }
    },
    // 必须放在最后，匹配所有未定义的地址
    {
        path: '/:pathMatch(.*)*',
        redirect: '/errorinfo'
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes,
})

//登录守卫
router.beforeEach((to) => {
    const token = useUserStore().token
    if (to.meta.requiresAuth && !token) {
        return {
            path: '/login',
            query: { redirect: to.fullPath },
            replace: true
        }
    }
})

export default router
