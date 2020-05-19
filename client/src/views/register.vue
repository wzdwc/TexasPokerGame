<template>
    <div class="register-container container">
        <div class="user-name input-bd">
            <div class="input-name">userName:</div>
            <div class="input-text">
                <input type="text"
                       v-model="userName"/>
            </div>
        </div>
        <div class="user-name input-bd">
          <div class="input-name">nickName:</div>
          <div class="input-text">
            <input type="text"
                   v-model="nickName"/>
          </div>
        </div>
        <div class="password input-bd">
            <div class="input-name">password:</div>
            <div class="input-text">
                <input type="password"
                       v-model="password"/>
            </div>
        </div>
        <div class="re-password input-bd">
            <div class="input-name">re-password:</div>
            <div class="input-text">
                <input type="password"
                       v-model="rePassword"/>
            </div>
        </div>
        <div class="s-btn btn"><span @click="register">submit</span></div>
      <toast :show="showMsg"
             :text="msg"></toast>
    </div>
</template>
<script lang="ts">
  import {Vue} from 'vue-property-decorator';
  import service from '../service';
  import Component from 'vue-class-component';
  import toast from '../components/toast.vue';

  @Component({
    components: {
      toast,
    },
  })
  export default class Register extends Vue {
    public userName: string = '';
    public password: string = '';
    private nickName: string = '';
    public rePassword: string = '';
    private showMsg = false;
    private msg = '';

    get valid() {
      return this.password === this.rePassword;
    }

    private async register() {
      try {
        if (!this.valid) {
          console.log('Those password didn\'t match.')
          return
        }
        const result = await service.register(this.userName, this.password, this.nickName);
        this.msg = 'sign successful';
        this.showMsg = true;
        setTimeout(() => {
          this.$router.replace({name: 'login'});
        }, 2000);
      } catch (e) {
        this.msg = JSON.stringify(e);
        this.showMsg = true;
        console.log(e);
      }
    }
  }
</script>
<style lang="less">

</style>
