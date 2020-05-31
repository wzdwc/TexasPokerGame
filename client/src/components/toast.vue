<template>
  <div class="toast-container">
    <div class="toast-body"
         v-show="showValue">
      {{text}}
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Watch, Vue } from 'vue-property-decorator';

  @Component
  export default class Toast extends Vue {
    @Prop() private text!: string;
    @Prop({ default: false, type: Boolean }) private show!: boolean;
    @Prop({ default: 3000, type: Number }) private timeOut!: number;

    private Time: any;

    get showValue() {
      console.log('come in1111', this.show);
      if (this.show) {
        this.close();
      }
      return this.show;
    }

    set showValue(val) {
      this.$emit('update:show', val);
    }

    private close() {
      console.log('come in');
      clearTimeout(this.Time);
      this.Time = setTimeout(() => {
        this.showValue = false;
        this.$emit('close');
      }, this.timeOut || 0);
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped
       lang="less">
  .toast-container {
    .toast-body {
      padding: 4px 10px;
      background: rgba(0, 0, 0, 0.6);
      text-align: center;
      color: #fff;
      font-size: 12px;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate3d(-50%, -50%, 0);
      border-radius: 4px;
      line-height: 16px;
    }
  }
</style>
