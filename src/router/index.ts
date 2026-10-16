import { createWebHistory,createRouter } from 'vue-router'


const routes = [
    {
        path: '/',
        name:'home',
        redirect: '/overview',
        component: () => import('../views/IndexView.vue'),
        children:[
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
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router