// 评论和私信组件共用的属性类型定义。
import type { ReplyData } from "../../utils/interface";
export type CommentProps = {
    pageSize?: number;

}
export type ReplyProps = {
    content?: ReplyData,
    // 是否需要头像和标签
    isComment: boolean,
}
// 对应视频中的informationProps
export type MessageProps = {
    active:boolean,
    pageSize?: number;
}