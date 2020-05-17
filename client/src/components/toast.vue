<template>
  <div class="toast-container">
    <div class="toast-body" v-show="showValue">
      {{text}}
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Watch, Vue} from 'vue-property-decorator';

  @Component
  export default class Toast extends Vue {
    @Prop() private text!: string;
    @Prop({default: false, type: Boolean}) private show!: boolean;
    @Prop({default: 1500, type: Number}) private timeOut!: number;

    private showValue = false;
    private Time: any;

    @Watch('show')
    private showChange(val: boolean) {
      this.showValue = val;
      if (val) {
        this.close();
      }
    }

    private close() {
      clearTimeout(this.Time);
      this.Time = setTimeout(() => {
        this.showValue = false;
        this.$emit('close');
      }, this.timeOut);
    }

    private created() {
      this.showValue = this.show;
      this.close();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped
       lang="less">
  .toast-container {
    .toast-body {
      padding: 2px 6px;
      background: rgba(0, 0, 0, 0.3);
      text-align: center;
      color: #fff;
      font-size: 12px;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate3d(-50%, -50%, 0);
      border-radius: 4px;
    }
  }
</style>
