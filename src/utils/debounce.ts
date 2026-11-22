// 按钮、输入等高频交互的防抖 / 节流工具：
// debounce：停止触发 wait 毫秒后才执行，适合搜索输入、重复提交；
// throttle：每 wait 毫秒最多执行一次，适合按钮点击这类需要即时反馈的操作。

type AnyFn = (...args: any[]) => any;

export interface DebounceOptions {
  // true 时首次调用立刻执行，wait 毫秒内的重复调用直接忽略
  immediate?: boolean;
}

export interface CancelableFn<T extends AnyFn> {
  // 立即执行时返回 fn 的返回值，被节流/防抖吞掉时返回 undefined
  (...args: Parameters<T>): ReturnType<T> | undefined;
  // 取消尚未执行的调用
  cancel: () => void;
  // 立即执行尚未执行的调用
  flush: () => void;
}

export const debounce = <T extends AnyFn>(
  fn: T,
  wait = 300,
  options: DebounceOptions = {}
): CancelableFn<T> => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const invoke = (): ReturnType<T> | undefined => {
    const args = lastArgs;
    lastArgs = null;
    return args ? fn(...args) : undefined;
  };

  const debounced = (...args: Parameters<T>): ReturnType<T> | undefined => {
    if (options.immediate) {
      // 冷却期内直接丢弃
      if (timer !== null) return;
      timer = setTimeout(() => {
        timer = null;
      }, wait);
      return fn(...args);
    }
    // 重新计时，只保留最后一次调用的参数
    clearTimer();
    lastArgs = args;
    timer = setTimeout(() => {
      timer = null;
      invoke();
    }, wait);
  };

  return Object.assign(debounced, {
    cancel: () => {
      clearTimer();
      lastArgs = null;
    },
    flush: () => {
      if (timer === null) return;
      clearTimer();
      invoke();
    },
  });
};

export const throttle = <T extends AnyFn>(fn: T, wait = 500): CancelableFn<T> => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastTime = 0;
  let lastArgs: Parameters<T> | null = null;

  const invoke = (): ReturnType<T> | undefined => {
    const args = lastArgs;
    lastArgs = null;
    return args ? fn(...args) : undefined;
  };

  const throttled = (...args: Parameters<T>): ReturnType<T> | undefined => {
    const now = Date.now();
    const remaining = wait - (now - lastTime);
    lastArgs = args;
    // 首次调用或已过等待期，立即执行
    if (remaining <= 0) {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = now;
      return invoke();
    }
    // 等待期内只保留最后一次参数，等待结束后补执行
    if (timer === null) {
      timer = setTimeout(() => {
        timer = null;
        lastTime = Date.now();
        invoke();
      }, remaining);
    }
  };

  return Object.assign(throttled, {
    cancel: () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      lastArgs = null;
      lastTime = 0;
    },
    flush: () => {
      if (timer === null) return;
      clearTimeout(timer);
      timer = null;
      lastTime = Date.now();
      invoke();
    },
  });
};

/* ------------------------------- 使用示例 -------------------------------
import { debounce, throttle } from "../../utils/debounce"; // 按文件相对位置调整

// 1. 按钮防重复点击（节流）：首次点击立刻执行，wait 内的重复点击合并成一次尾部执行
const onSubmit = throttle(() => submitApi(form), 500);

// 2. 搜索输入（防抖）：停止输入 300ms 后才真正发请求
const onSearch = debounce((keyword: string) => getData(keyword), 300);

// 3. 只在第一次触发（immediate）：wait 内的重复点击直接丢弃，立即执行时可拿到返回值
const onSave = debounce(() => save(), 800, { immediate: true });

// 4. 组件卸载时清掉还没执行的调用，避免卸载后继续发请求
onUnmounted(() => onSubmit.cancel());

// 5. 需要马上补一次执行（比如遮罩关闭前提交最后一次输入）时用 flush()
onSearch.flush();

注意：
- 被包装的函数收到的是「最后一次调用」的参数，连续点 1、2、3 最终执行的是 3。
- 带参数的处理函数不要共用一个实例：throttle(deleteArticle) 绑到多个列表项时，会互相吞掉点击。
  按 id 各建一个实例，或者改用按钮的 loading / disabled。
- fn 同步抛错时会正常向上抛，内部状态已复位，后续调用不受影响。
- 定时器里执行的 fn 抛错属于普通异步错误，需要在 fn 内部自己 try/catch。
---------------------------------------------------------------------- */
