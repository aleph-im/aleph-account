
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('pages/Index.vue')
      },
      // {
      //   name: 'swap',
      //   path: 'swap',
      //   component: () => import('pages/Swap.vue')
      // },
      {
        name: 'stake',
        path: '',
        component: () => import('pages/Stake.vue')
      },
      {
        name: 'ipfs',
        path: 'ipfs',
        component: () => import('pages/IPFSPin.vue')
      },
      {
        name: 'nft-storage',
        path: 'nft-storage',
        component: () => import('pages/NFTStorage.vue')
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
