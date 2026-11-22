import { baseUrl } from "./env";
import axios from 'axios';
import { useUserStore } from "../store/user";
// 直接引入组件库的消息方法：axios 是独立模块，
import { YkMessage } from '@yike-design/ui';

const service = axios.create({
    baseURL: baseUrl,
    timeout: 5000,
});

// 添加请求拦截器
service.interceptors.request.use(function (config) {
    const token = useUserStore().token
    if (token) {
        config.headers.set('Authorization', `Bearer ${token}`)
    }
    // 在发送请求之前做些什么
    return config;
}, function (error) {
    // 对请求错误做些什么
    YkMessage({ type: "warning", message: error.message });
    return Promise.reject(error);
});

// 添加响应拦截器
service.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response.data;
}, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    YkMessage({ type: "warning", message: error.message });
    return Promise.reject(error);
});


export default service;