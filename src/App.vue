<script setup lang="ts">
      import router from "@/router";
      import {useCookies} from "@/common";
      import {onMounted} from "vue";
      import {useCommonStore} from "@/store";
      import {updateUserInfo} from "../util";
      const cookies = useCookies();
      const store = useCommonStore()
      onMounted(()=>{
        if(cookies.isKey("token")){
          updateUserInfo(cookies,store)
          router.push("/user")
        }else{
          router.push("/login")
        }
      })
</script>

<template>
    <RouterView class="common-layout"></RouterView>
</template>

<style scoped>
.common-layout {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}


</style>