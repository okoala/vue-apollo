import Vue from 'vue'
import Router from 'vue-router'
import { createView } from '../views/CreateView'

Vue.use(Router)

export default new Router({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    { path: '/test', component: createView('test') },
    { path: '*', redirect: '/test' }
  ]
})
