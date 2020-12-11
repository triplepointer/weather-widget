import Vue from "vue";
import wrap from '@vue/web-component-wrapper';
import App from "./App.vue";
import 'bootstrap/dist/css/bootstrap.min.css';

Vue.config.productionTip = false;

const CustomElement = wrap(Vue, App);

window.customElements.define('vue-widget', CustomElement);
