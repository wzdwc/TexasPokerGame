<template>
    <div class="login container">
        <div class="user-name input-bd">
            <div class="input-name">userName:</div>
            <div class="input-text">
                <input type="text"
                       v-model="userAccount"/>
            </div>
        </div>
        <div class="password input-bd">
            <div class="input-name">password:</div>
            <div class="input-text">
                <input type="password"
                       v-model="password"/>
            </div>
        </div>
        <div class="login-btn btn">
            <span @click="login">sign in</span>
            <b @click="signUp">sign up</b>
        </div>
    </div>
</template>
<script lang="ts">
  import {Vue} from 'vue-property-decorator';
  import service from '../service';
  import Component from 'vue-class-component';
  import cookie from 'js-cookie';

  @Component
  export default class Login extends Vue {
    public userAccount: string = '';
    public password: string = '';

    private signUp() {
      this.$router.replace({name: 'register'});
      return;
    }

    private async login() {
      try {
        const result = await service.login(this.userAccount, this.password);
        const { token } = result.data;
        cookie.set('token', token, {expires: 1});
        this.$router.replace({name: 'home'});
        console.log(result);
      } catch (e) {
        console.log(e);
      }
    }
  }
</script>
<style lang="less">
</style>
