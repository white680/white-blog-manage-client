<template>
  <div class="login">
    <yk-space class="login__main" dir="vertical">
      <div dir="vertical" class="login__main__title">
        <img src="../images/white-blog-icon-v2.png" alt="white的博客后台管理" />
        <p>子超兄博客管理平台--注册</p>
      </div>
      <div class="login__main__content">
        <yk-form ref="formRef" :model="form">
          <yk-form-item label="账号" field="username">
            <yk-input v-model="form.username" style="width: 240px" placeholder="请输入用户名"></yk-input>
          </yk-form-item>
          <yk-form-item label="密码" field="password">
            <yk-input v-model="form.password" placeholder="请输入密码" type="password" style="width: 240px"></yk-input>
          </yk-form-item>
          <yk-form-item label="重复密码" field="repassword">
            <yk-input v-model="form.repassword" placeholder="请输入再次密码" type="password" style="width: 240px"></yk-input>
          </yk-form-item>
          <yk-form-item style="margin-top: 20px">
            <yk-space style="width: 100%" align="center" :size="20">
              <yk-button type="primary" @click="resetForm" style="width: 110px; --pcolor: #8a3ee8">重置</yk-button>
              <yk-button @click="submitForm" style="width: 110px; --pcolor: #8a3ee8">注册</yk-button>
            </yk-space>
          </yk-form-item>
        </yk-form>
      </div>
    </yk-space>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { getCurrentInstance, reactive } from "vue";
import { registerApi } from "../api/index";
import { useCode } from "../hook/code";

// Code验证
const { tackleCode } = useCode();

const proxy: any = getCurrentInstance()?.proxy;
const router = useRouter();

const form = reactive({
  username: "",
  password: "",
  repassword: "",
});

const resetForm = () => {
  form.username = "";
  form.password = "";
  form.repassword = "";
};
// 提交
const submitForm = async () => {
  if (!form.username || !form.password || form.password !== form.repassword) {
    proxy.$message({ type: "warning", message: "输入不完整或两次密码不一致" });
    return;
  }
  const req = {
    name: form.username,
    password: form.password,
    mail: "2065610135@qq.com", // 当前源码固定邮箱；改为真实邮箱需增加表单字段
    moment: new Date(),
  };
  try {
    const res: any = await registerApi(req);
    if (res.code !== 200) {
      proxy.$message({ type: "warning", message: res.msg ?? "注册失败" });
      return;
    }
    resetForm();
    proxy.$message({ type: "success", message: "注册成功，3s后跳转到登录页" });
    setTimeout(() => router.push("/login"), 3000);
  } catch (error) {
    console.error("注册请求失败", error);
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
