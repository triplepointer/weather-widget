import Vue from "vue";
import App from "./App.vue";
import 'bootstrap/dist/css/bootstrap.min.css';

import vueCustomElement from 'vue-custom-element'
import 'document-register-element/build/document-register-element'

Vue.use(vueCustomElement)

Vue.config.productionTip = false;

Vue.customElement('vue-widget', App)
