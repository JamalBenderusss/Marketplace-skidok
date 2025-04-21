import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import { configure } from 'vee-validate';

import './assets/main.css';
// import { required } from '@vee-validate/rules';

// configure({
//     validateOnInput: true,
//     generateMessage : (ctx) => {
//         const messages = {
//             required: `Поле ${ctx.field} обязательно для заполнения`,
//             email: `Введите корректный email`,
//             password: `Пароль введен не корректно`,
//             min: `Поле ${ctx.field} должно быть не менее ${ctx.length} символов`,
//             max: `Поле ${ctx.field} должно быть не более ${ctx.length} символов`,
//         };
//         return messages[ctx.rule.name] || 'Error';
//         },
        
// });

const app = createApp(App);
app.use(router);
app.mount('#app');
