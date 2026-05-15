<template>
  <div id="app">
    <ShotDivision />
  </div>
</template>

<script>
import ShotDivision from './components/ShotDivision.vue'

export default {
  name: 'App',
  components: {
    ShotDivision
  }
}
</script>

<style>
#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #303133;
  margin: 0;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}
</style>