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
            }
        ]
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router