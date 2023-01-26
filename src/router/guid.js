/* eslint-disable no-unused-vars */
import { THEME_STORE, USER_STORE } from '@/store/constant'
import { createDiscreteApi, darkTheme, lightTheme } from 'naive-ui'
import { computed, watch } from 'vue'
import store from '@/store'
import { useDocumentVisibility, useTimeoutFn } from '@vueuse/core'

const Theme = computed(() => store.getters[THEME_STORE.GET_MODEL])

// 使用文档可见性
const visibility = useDocumentVisibility()

/**
 * > 设置页面标题为页面名称，没有名称则设置为“BBlog ✍🏻 | 404🤯"
 */
const setTitle = to => {
  document.title = `BBlog ✍🏻 |${to.meta.name ? to.meta.name : '404🤯'}`
}

export const setUpRouter = router => {
  /* 返回主题对象的计算属性。 */
  const configProviderPropsRef = computed(() => ({
    theme: Theme.value === 'white' ? lightTheme : darkTheme
  }))

  /* 一种创建加载栏的方法。,在setup函数外部使用 */
  const { loadingBar, message } = createDiscreteApi(['loadingBar', 'message'], {
    configProviderProps: configProviderPropsRef
  })

  /* 路由器挂钩。 */
  router.beforeEach((to, from) => {
    // 显示加载条
    loadingBar?.start()
    if (to.meta.requiresAuth) {
      const CurrentUser = computed(
        () => store.getters[USER_STORE.GET_CURRENT_USER]
      )
      console.log(CurrentUser.value)
      // message.error('请登录')
      // return '/login'
    }
  })

  router.afterEach((to, from) => {
    setTitle(to)

    /* 将在 2 秒后运行该函数的挂钩。 */
    const { start, stop } = useTimeoutFn(() => {
      setTitle(to)
    }, 2000)

    loadingBar?.finish()

    to.meta.transition = 'fade'

    /* 监视文档可见性的挂钩。如果文档可见且之前的状态隐藏，则文档标题设置为“🎉🎉🎉Welcome Back”并调用启动函数。如果文档是隐藏的并且之前的状态是可见的，则调用停止函数并将文档标题设置为“Always here °꒰๑'ꀾ'๑꒱°”。 */
    watch(visibility, (current, previous) => {
      if (current === 'visible' && previous === 'hidden') {
        document.title = '🎉🎉🎉Welcome Back'
        start()
      } else if (current === 'hidden' && previous === 'visible') {
        stop()
        document.title = `Always here °꒰๑'ꀾ'๑꒱°`
      }
    })
  })
}
