import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import App from './App.vue'
import router from './router'
import './styles/theme.css'
import './styles/global.css'
import { useThemeStore } from './stores/theme'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const themeStore = useThemeStore()
themeStore.initTheme()

app.use(router)
app.use(ElementPlus)
app.mount('#app')
