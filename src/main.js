import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';

import VueTextareaAutosize from 'vue-textarea-autosize';
Vue.use(VueTextareaAutosize);

import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDT5htRZ0V8FQxVxNyMnGSIVozVf-5xmco",
  authDomain: "firevue-6eaa9.firebaseapp.com",
  databaseURL: "https://firevue-6eaa9.firebaseio.com",
  projectId: "firevue-6eaa9",
  storageBucket: "firevue-6eaa9.appspot.com",
  messagingSenderId: "808771858925",
  appId: "1:808771858925:web:e84ad6fd6dca84b4fb37e4"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
