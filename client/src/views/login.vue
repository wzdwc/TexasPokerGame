<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import HelloWorld from './components/HelloWorld.vue';

  @Component({
    components: {
      HelloWorld,
    },
  })
  export default class Login extends Vue {
    userName: string = '';
    password: string = '';
    login() {}
  }
</script>
