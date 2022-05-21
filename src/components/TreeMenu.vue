<template>
  <template v-for="menu in userMenu" :key="menu._id">
    <el-sub-menu v-if="menu.children && menu.children.length>0 && menu.children[0].menuType == 1" :index="menu.path">
      <template #title>
        <el-icon>
          <component :is="menu.icon" />
        </el-icon>
        <span>{{menu.menuName}}</span>
      </template>
      <TreeMenu :userMenu="menu.children" />
    </el-sub-menu>
    <el-menu-item v-else-if="menu.menuType == 1" :index="menu.path">{{menu.menuName}}</el-menu-item>
  </template>
</template>

<script>
export default {
  name: 'TreeMenu',
  props: {
    userMenu: {
      type: Array,
      default() {
        return []
      }
    }
  }
}
</script>

<style>
</style>