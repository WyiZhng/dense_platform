
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueCookies from 'vue-cookies'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'jose'
import {createPinia} from "pinia";
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import "@/style.css"
const app = createApp(App);
const pinia = createPinia()

app.use(ElementPlus,{
    locale:zhCn
});
app.use(router);
app.use(VueCookies);

app.use(pinia);
app.mount('#app');
