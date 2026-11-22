import fetch from '../utils/axios';


// 判断是否有注册接口
export const isRegisterApi = (data: object) => fetch.post('/isRegister', data)

// 用户注册接口
export const registerApi = (data: object) => fetch.post('/register', data)

// 用户登录接口
export const signinApi = (data: object) => fetch.post('/signin', data)

// 总览数据获取接口
export const overviewApi = (data: object) => fetch.post('/overview', data)

// 获取评论接口
export const commentApi = (data: object) => fetch.post('/comment', data)

// 删除评论接口
export const deleteCommentApi = (data: object) => fetch.post('/deleteComment', data)

//获取私信接口
export const getMessageApi = (data: object) => fetch.post('/getMessage', data)

// 获取私信未读数据接口
export const getNoreadMessageApi = (data: object) => fetch.post('/getNoreadMessage', data)

// 删除私信接口
export const deleteMessageApi = (data: object) => fetch.post('/deleteMessage', data)

// 获取文章接口
export const articleApi = (data: object) => fetch.post('/article', data)

// 文章发布/文章撤回接口
export const changeArticleStateApi = (data: object) => fetch.post('/changeArticleState', data)

// 文章删除接口
export const deleteArticleApi = (data: object) => fetch.post('/deleteArticle', data)

// 分组和未分组文章数据接口
export const articleStateApi = (data: object) => fetch.post("/articleState", data);

// 获取分组接口
export const subsetApi = (data: object) => fetch.post('/subset', data)

// 新建分组接口
export const addSubsetApi = (data: object) => fetch.post('/addSubset', data)

// 修改分组名称接口
export const updateSubsetApi = (data: object) => fetch.post('/updateSubset', data)

// 删除分组接口
export const deleteSubsetApi = (data: object) => fetch.post('/deleteSubset', data)

// 获取标签接口
export const labelApi = (data: object) => fetch.post('/label', data)

// 新建标签接口
export const addLabelApi = (data: object) => fetch.post('/addLabel', data)

// 删除标签接口
export const deleteLabelApi = (data: object) => fetch.post('/deleteLabel', data)

// 获取随笔随记接口
export const diaryApi = (data: object) => fetch.post('/diary', data)

// 新建随笔随记接口
export const createDiaryApi = (data: object) => fetch.post('/createDiary', data)

// 删除随笔随记接口
export const deleteDiaryApi = (data: object) => fetch.post('/deleteDiary', data)
 
// 新建文章/图库接口
export const createArticleApi = (data: object) => fetch.post('/createArticle', data)

//上传文件
export const uploadApi = (data: object) => fetch.post('/upload', data)

// 获取文章/图库用于修改
export const gainArticleApi = (data: object) => fetch.post('/gainArticle', data)

// 文章/图库修改
export const updateArticleApi = (data: object) => fetch.post('/updateArticle', data)

// 获取文件
export const getFileApi = (data: object) => fetch.post('/getFile', data)

// 修改文件显示名称
export const renameFileApi = (data: { fileId: number; fileName: string; token: string }) => fetch.post('/renameFile', data)

// 删除未被内容引用的文件（单张或批量）
export const deleteFileApi = (data: { filesId: number[]; token: string }) => fetch.post('/deleteFile', data)
