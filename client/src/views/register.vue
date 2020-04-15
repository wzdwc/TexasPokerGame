<template>
    <div class="register-container">
        <div class="user-name">user name <input type="text" v-model="userName"></div>
        <div class="password">user name <input type="password" v-model="password"></div>
        <div class="re-password">password: <input type="password" v-model="rePassword"></div>
        <div class="s-btn" > <span @click="register">submit</span></div>
    </div>
</template>
<style type='less'>
</style>
<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator';
  import service from '../service'

  @Component({
    components: {},
  })
  export default class Register extends Vue {
    userName: string = '';
    password: string = '';
    rePassword: string = '';
    async register() {
      try {
        const option = {
          userName: this.userName,
          password: this.password,
        }
        const result = await service.register(...option)
      } catch (e) {
        console.log(e)
      }

    }
  }
</script>
