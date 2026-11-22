import { useRouter } from 'vue-router'
import { YkMessage } from '@yike-design/ui';
import { useUserStore } from '../store/user'
export function useCode() {
    const router = useRouter();
    const userStore = useUserStore();
    // Code验证
    const tackleCode = (e: number | string) => {
        if (e === 300) {
            // 未通过验证
            userStore.$reset()
            router.push('/login')
            YkMessage({ type: "warning", message: "登录验证失败，请重新登录~" });
            return false;
        } else if (e === 400) {
            // 传递参数问题
            YkMessage({ type: "error", message: "请求参数不正确" });
            return false;
        } else if (e === 401) {
            // 未发现用户
            router.push('/register');
            return false;
        } else {
            return true;
        }
    }
    return {
        tackleCode,
    }
}