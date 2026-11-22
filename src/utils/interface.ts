// 跨组件共享的数据结构，供文章、图库、日记和回复模块复用。
// 回复内容
export type ReplyData = {
    id: number;
    article?: {
        id: number;
        title: string;
    };
    user_id: string | number;
    user_name: string;
    content: string;//内容
    moment: string;//时间
    complaint?: number;//举报数
};

// 分组
export interface SubsetData {
    id: number | string;
    name: string | number;
    value: number;
    moment?: string
}

// 文件
export interface FileData {
    id: number,
    url: string, //地址路径
    fileName: string, //文件名
    format: string, //格式
    subsetId: number, //所属类型
    selected?: boolean //是否选择
}

//标签
export interface LabelData {
    id: number | string
    label_name: string | number
    moment?: string
}

// 文章
// 新建文章和图库共用的表单数据，编辑时也使用同一结构回填
export interface ArticleFormData {
    title: string;
    subset_id?: number;
    classify: number;
    label?: string;
    introduce?: string;
    content?: string;
    cover?: string;
    state?: number;
    moment: Date;
}

export interface ArticleData {
    id: number;
    title: string;
    subsetId?: number;
    moment: Date;//时间
    label?: string[];
    introduce?: string;//简介 
    cover?: string;//封面地址
    views: number;//查看次数
    state: number;//状态0未发布、1已发布
    comment: number;//评论数
    praise: number;//点赞次数
    content?: string | string[]
}
// 日记
export interface DiaryeData {
    id: number;
    title: string;
    moment: string;//时间
    weatherId: number;//天气
    content: string;
    picture?: string[];
}
// 文件
export interface FileData {
    id: number;
    url: string;//地址
    fileName: string;//文件名 
    format: string;//格式
    subset_id?: number;//所属类型 
}
