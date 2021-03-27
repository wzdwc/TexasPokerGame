<template>
    <div class="login-container container">
      <div class="login-body">
        <div class="name">J-POKER</div>
        <div class="user-name input-bd">
          <div class="input-name iconfont icon-account"></div>
          <div class="input-text">
            <input type="text"
                   v-model="userAccount"/>
          </div>
        </div>
        <div class="password input-bd">
          <div class="input-name  iconfont icon-password"></div>
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
        localStorage.setItem('token', token)
        await this.$router.push({name: 'home'});
      } catch (e) {
        this.$plugin.toast('Wrong password or account.');
      }
    }
  }
</script>
<style lang="less" scoped>
  .login-container{
    background: radial-gradient(#00bf86, #006a55);
    background-size: 100% 100%;
    width: 100vw;
    height: 100vh;
    padding: 50vw 0;
    box-sizing: border-box;
    .login-body{
      width: 85vw;
      margin: auto;
      border-radius: 4px;
      box-sizing: border-box;
      box-shadow: 2px 3px 9px rgba(0, 0, 0, 0.3);
      background-color: #fff;
      padding: 30px;
      .input-bd{
        border: 1px solid #bababa;
        border-radius: 20px;
        width: 60vw;
        margin: 30px auto;
        text-align: left;
        .input-name{
          text-align: center;
          font-size: 18px;
          color: #bababa;
        }
        input{
          height: 40px;
          background-color: transparent;
        }
      }
    }
  }
</style>
