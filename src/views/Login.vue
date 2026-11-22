<template>
  <div class="login">
    <yk-space class="login__main" dir="vertical">
      <div dir="vertical" class="login__main__title">
        <img src="../images/white-blog-icon-v2.png" alt="white的博客后台管理" />
        <p>子超兄博客管理平台--登录</p>
      </div>
      <div class="login__main__content">
        <yk-form ref="formRef" :model="form">
          <yk-form-item label="账号" field="username">
            <yk-input v-model="form.username" style="width: 240px" placeholder="请输入用户名"></yk-input>
          </yk-form-item>
          <yk-form-item label="密码" field="password">
            <yk-input v-model="form.password" placeholder="请输入密码" type="password" style="width: 240px"></yk-input>
          </yk-form-item>
          <yk-form-item style="margin-top: 20px">
            <yk-space style="width: 100%" align="center" :size="20">
              <yk-button type="primary" @click="resetForm" style="width: 110px; --pcolor: #8a3ee8">重置</yk-button>
              <yk-button @click="submitForm" style="width: 110px; --pcolor: #8a3ee8">登录</yk-button>
            </yk-space>
          </yk-form-item>
        </yk-form>
      </div>
    </yk-space>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { getCurrentInstance, reactive } from "vue";
import { signinApi } from "../api/index";
import { useCode } from "../hook/code";
import { useUserStore } from "../store/user";


// Code验证
const { tackleCode } = useCode();

const useUser = useUserStore();

const proxy: any = getCurrentInstance()?.proxy;
const router = useRouter();
const route = useRoute();

const form = reactive({
  username: "",
  password: "",
});

const resetForm = () => {
  form.username = "";
  form.password = "";
};

// 提交
const submitForm = async () => {
  if (!form.username || !form.password) {
    proxy.$message({ type: "warning", message: "输入不完整" });
    return;
  }
  try {
    const res: any = await signinApi({ name: form.username, psw: form.password });
    if (res.code === 200 && res.data?.token) {
      useUser.$patch(res.data);
      proxy.$message({ type: "success", message: "登录成功！" });
      const redirect = route.query.redirect;
      router.replace(typeof redirect === "string" ? redirect : "/");
    } else if (res.code === 400) {
      proxy.$message({ type: "error", message: "用户不存在或者密码错误" });
      form.password = "";
    } else {
      proxy.$message({ type: "warning", message: res.msg ?? "登录失败" });
    }
  } catch (error) {
    console.error("登录请求失败", error);
  }
};
</script>

<style scoped lang="less">
.login {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: @bg-color-m;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;

  .login__main {
    width: 500px;
    height: 500px;
    background: @bg-color-l;
    align-items: center;
    padding: 30px;

    .login__main__title {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      width: 100%;

      img {
        width: 100px;
        height: 100px;
      }

      p {
        .font-xl();
        color: @font-color-l;
        font-weight: 600;
      }
    }

    .login__main__content {
      padding: 40px 0;
      width: 100%;
    }
  }
}
</style>
