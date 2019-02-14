declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module 'Vue/types/vue' {
  import axios, { AxiosInstance } from 'axios'
  interface Vue {
    $axios: AxiosInstance
  }
}