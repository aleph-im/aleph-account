
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'dashboard',
        path: '',
        component: () => import('pages/Index.vue')
      },
      {
        name: 'swap',
        path: 'swap',
        component: () => import('pages/Swap.vue')
      },
      {
        name: 'stake',
        path: 'stake',
        component: () => import('pages/Stake.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
