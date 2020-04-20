<template>
    <div class="register-container container">
        <div class="user-name input-bd">
            <div class="input-name">userName:</div>
            <div class="input-text">
                <input type="text"
                       v-model="userName"/>
            </div>
        </div>
        <div class="password input-bd">
            <div class="input-name">password:</div>
            <div class="input-text">
                <input type="text"
                       v-model="password"/>
            </div>
        </div>
        <div class="re-password input-bd">
            <div class="input-name">re-password:</div>
            <div class="input-text">
                <input type="text"
                       v-model="rePassword"/>
            </div>
        </div>
        <div class="s-btn btn"><span @click="register">submit</span></div>
    </div>
</template>
<script lang="ts">
  import {Vue} from 'vue-property-decorator';
  import service from '../service';
  import Component from 'vue-class-component';

  @Component
  export default class Register extends Vue {
    public userName: string = '';
    public password: string = '';
    public rePassword: string = '';

    get vaild() {
      return this.password === this.rePassword;
    }

    private async register() {
      try {
        const result = await service.register(this.userName, this.password);
      } catch (e) {
        console.log(e);
      }
    }
  }
</script>
<style lang="less">

</style>
