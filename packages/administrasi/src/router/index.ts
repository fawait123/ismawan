import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layout/AppLayout.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                }
            ],
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/user',
                    name: 'user',
                    component: () => import('@/views/user/index.vue')
                },
                {
                    path: '/activity',
                    name: 'activity',
                    component: () => import('@/views/activity/index.vue')
                },
                {
                    path: '/employee',
                    name: 'employee',
                    component: () => import('@/views/employee/index.vue')
                },
                {
                    path: '/company',
                    name: 'company',
                    component: () => import('@/views/company/index.vue')
                },
                {
                    path: '/',
                    children: [
                        {
                            path: '/member-work-result',
                            name: 'member-work-result',
                            component: () => import('@/views/member-work/index.vue')
                        },
                        {
                            path: '/member-work-result/detail/:id',
                            name: 'member-work-result-detail',
                            component: () => import('@/views/member-work/detail.vue')
                        },
                        {
                            path: '/member-work-result/form',
                            name: 'member-work-result-form',
                            component: () => import('@/views/member-work/form.vue')
                        }
                    ]
                },
                {
                    path: '/',
                    children: [
                        {
                            path: '/invoice',
                            name: 'invoice',
                            component: () => import('@/views/invoice/index.vue')
                        },
                        {
                            path: '/invoice/form',
                            name: 'invoice-form',
                            component: () => import('@/views/invoice/form.vue')
                        }
                    ]
                }
            ],
            meta: {
                requiresAuth: true
            }
        },
        {
            path: "/login",
            component: () => import('@/views/login/index.vue')
        },
        {
            path: "/error",
            component: () => import('@/views/error/index.vue')
        },
        {
            path: "/not-found",
            component: () => import('@/views/not-found/index.vue')
        }
    ]
})

router.beforeEach((to, from) => {
    if (to.meta.requiresAuth && !checkIsLogin()) {
        return {
            name: "login"
        }
    }

    if (!to.meta.requiresAuth && checkIsLogin()) {
        return {
            name: "dashboard"
        }
    }

    return true;
})

const checkIsLogin = () => {
    const token = localStorage.getItem('token')

    return token ? true : false
}
export default router
