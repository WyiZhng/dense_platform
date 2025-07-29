import { createRouter, createWebHistory } from 'vue-router'

// Lazy load components for better performance
const Home = () => import('@/components/pages/Home/index.vue')
const Personal = () => import('@/components/pages/Profile/index.vue')
const Check = () => import('@/components/pages/CariesCheck/index.vue')
const History = () => import('@/components/pages/CariesHistory/index.vue')
const HistoryList = () => import('@/components/pages/CariesHistory/parts/HistoryList.vue')
const HistoryDetail = () => import('@/components/pages/CariesHistory/parts/HistoryDetail.vue')
const AccountAccess = () => import('@/components/pages/AccountAccess/index.vue')
const DensePlatform = () => import("@/DensePlatform.vue")

// Admin pages
const AdminDashboard = () => import('@/components/pages/Admin/Dashboard/index.vue')
const AdminUsers = () => import('@/components/pages/Admin/Users/index.vue')
const AdminUserDetail = () => import('@/components/pages/Admin/Users/UserDetail.vue')
const AdminRoles = () => import('@/components/pages/Admin/Roles/index.vue')
const AdminAudit = () => import('@/components/pages/Admin/Audit/index.vue')
const AdminConfig = () => import('@/components/pages/Admin/Config/index.vue')

// Doctor pages
const DoctorDashboard = () => import('@/components/pages/Doctor/Dashboard/index.vue')
const DoctorReports = () => import('@/components/pages/Doctor/Reports/index.vue')
const DoctorReportDetail = () => import('@/components/pages/Doctor/Reports/ReportDetail.vue')
const DoctorCollaboration = () => import('@/components/pages/Doctor/Collaboration/index.vue')
const DoctorProfilePage = () => import('@/components/pages/Doctor/Profile/index.vue')

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            redirect: "/user/home"
        },
        {
            path: "/login",
            component: AccountAccess
        },
        {
            path: "/user",
            component: DensePlatform,

            children: [
                {
                    path: "",
                    redirect: "/user/home"
                },
                {

                    path: "home",
                    component: Home,

                },
                {
                    path: "personal",
                    component: Personal
                },
                {
                    path: "check",
                    component: Check,

                },
                {
                    path: "history",
                    component: History,
                    children: [
                        {
                            path: "",
                            component: HistoryList
                        }, {
                            path: ":id",
                            component: HistoryDetail
                        }
                    ]
                }
            ]
        },
        {
            path: "/admin",
            component: DensePlatform,
            meta: { requiresAuth: true, role: 'admin' },
            children: [
                {
                    path: "",
                    redirect: "/admin/dashboard"
                },
                {
                    path: "dashboard",
                    component: AdminDashboard,
                    meta: { title: '管理员仪表板' }
                },
                {
                    path: "users",
                    component: AdminUsers,
                    meta: { title: '用户管理' }
                },
                {
                    path: "users/:id",
                    component: AdminUserDetail,
                    meta: { title: '用户详情' }
                },
                {
                    path: "roles",
                    component: AdminRoles,
                    meta: { title: '角色管理' }
                },
                {
                    path: "audit",
                    component: AdminAudit,
                    meta: { title: '审计日志' }
                },
                {
                    path: "config",
                    component: AdminConfig,
                    meta: { title: '系统配置' }
                }
            ]
        },
        {
            path: "/doctor",
            component: DensePlatform,
            meta: { requiresAuth: true, role: 'doctor' },
            children: [
                {
                    path: "",
                    redirect: "/doctor/dashboard"
                },
                {
                    path: "dashboard",
                    component: DoctorDashboard,
                    meta: { title: '医生工作台' }
                },
                {
                    path: "reports",
                    component: DoctorReports,
                    meta: { title: '报告管理' }
                },
                {
                    path: "reports/:id",
                    component: DoctorReportDetail,
                    meta: { title: '报告详情' }
                },
                {
                    path: "collaboration",
                    component: DoctorCollaboration,
                    meta: { title: '协作诊断' }
                },
                {
                    path: "profile",
                    component: DoctorProfilePage,
                    meta: { title: '医生资料' }
                }
            ]
        }
    ]
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    const isAuthenticated = !!token

    // If going to login page and already authenticated, redirect to appropriate home
    if (to.path === '/login' && isAuthenticated) {
        // You might want to check user type here and redirect accordingly
        next('/user/home')
        return
    }

    // If accessing protected routes without authentication, redirect to login
    if (to.meta?.requiresAuth && !isAuthenticated) {
        next('/login')
        return
    }

    // If accessing root path without authentication, redirect to login
    if (to.path === '/' && !isAuthenticated) {
        next('/login')
        return
    }

    next()
})

export default router
