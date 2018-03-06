import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'login',
      component: () =>
        import ('@plat/login')
    },
    {
      path: '/layout',
      name: 'layout',
      component: () =>
        import ('@/views/layout'),
      redirect: "/layout/reportCenter",
      children: [{
          path: 'reportCenter',
          name: 'reportCenter',
          component: () =>
            import ('@plat/reportCenter')
        },
        {
          path: 'dataBase',
          name: 'dataBase',
          component: () =>
            import ('@plat/dataBase')
        },
        {
          path: 'project',
          name: 'project',
          component: () =>
            import ('@plat/project')
        },
        {
          path: 'userCenter',
          name: 'userCenter',
          component: () =>
            import ('@plat/userCenter')
        }
      ]
    },
    {
      path: '/edit',
      name: 'edit',
      component: () =>
        import ('@plat/edit')
    },
  ]
})
