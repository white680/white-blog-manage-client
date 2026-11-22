// 统一将日期值格式化为列表展示用的时间字符串：
// 1 小时内显示为「xx分钟前」，3 小时内显示为「xx小时前」，
// 超过 3 小时显示为「dd/MM 时:分」，非本年显示为「yyyy/MM/dd 时:分」。
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

const pad = (value: number): string => String(value).padStart(2, "0");

const clock = (date: Date): string =>
  pad(date.getHours()) + ":" + pad(date.getMinutes());

export const momentm = (date: Date | string | number): string => {
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return "";

  const now = new Date();
  const diff = now.getTime() - target.getTime();

  if (diff >= 0 && diff < HOUR) {
    return Math.max(1, Math.floor(diff / MINUTE)) + "分钟前";
  }
  if (diff >= 0 && diff < 3 * HOUR) {
    return Math.floor(diff / HOUR) + "小时前";
  }

  const day = pad(target.getDate());
  const month = pad(target.getMonth() + 1);
  const year = target.getFullYear();

  if (year === now.getFullYear()) {
    return day + "/" + month + " " + clock(target);
  }
  return year + "/" + month + "/" + day + " " + clock(target);
};
