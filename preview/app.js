import Vue from 'vue';
import App from './app.vue';
import vCalendar from '../src/lib';
import './thu';

Vue.use(vCalendar);

const app = new Vue({
  render: h => h(App),
});

app.$mount('#app');
