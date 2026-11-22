// 为 wangEditor Vue 组件补充当前依赖包缺失的类型声明。
// wangEditor Vue 包的 exports 没有暴露 types，补充组件声明供 vue-tsc 使用
declare module "@wangeditor/editor-for-vue" {
  import type { DefineComponent } from "vue";
  export const Editor: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export const Toolbar: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
}
