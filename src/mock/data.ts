import Mock from 'mockjs';
const Random = Mock.Random;

// 总览数据
export const overview = Mock.mock({
    code: 200,
    data: {
        "file": Random.float(60, 100, 3, 2) + 'M',
        "article|0-50": 0,
        "gallery|0-50": 0,
        "diary|0-50": 0,
    }
})

// 访问数据
export const visit = Mock.mock({
    "data|30": [
        {
            // 时间
            "date": "@datetime('MM-dd')",
            // 访问量
            "count|1-100": 12,
        }
    ]
})
// 数据检测
export const survey = Mock.mock({
    "data": {
        "device": [
            {
                "key": 'mobile',
                "name": '移动端',
                "value|30-120": 50,
            },
            {
                "key": 'pc',
                "name": '电脑端',
                "value|30-120": 30,
            },
        ],
        "website": [
            {
                "key": 'home',
                "name": '首页',
                "value|30-120": 50,
            },
            {
                "key": 'project',
                "name": '项目',
                "value|30-120": 30,
            },
            {
                "key": 'diary',
                "name": '日记',
                "value|30-120": 30,
            },
            {
                "key": 'photo',
                "name": '摄影',
                "value|30-120": 30,
            },
        ]
    }
})
// 评论数据
export const comment = Mock.mock({
    "data": {
        "count": 123,
        "list|123": [{
            "id|+1": 0,
            "article": {
                "id|+1": 2,
                "title": "@ctitle(3,12)",
            },
            "user": {
                "id|+1": 3,
                "name": "@ctitle(3,12)",
                "imgUrl": "../../images/pic.png"
            },
            "comment": "@cparagraph(1,3)",
            "moment": "@datetime('yyyy-MM-dd HH:mm:ss')",
            "complaint|0-12": 0,
        }]
    }
})

// 文章状态
export const state = Mock.mock({
    "data": [
        {
            "id": 0,
            "name": "已发布",
            "value|0-30": 4
        },
        {
            "id": 1,
            "name": "未发布",
            "value|0-30": 4
        }
    ]
})
// 分组
export const subset = Mock.mock({
    "data":{
        "count":120,
        "list|4":[
            {
                "id|+1": 0,
                "name": "@ctitle(3,5)",
                "value|0-30": 4,
                "moment":"@datetime()"
            }
        ]
    }
})
// 模拟数据：图片合集
const photos = [
    "a.jpg",
    "b.jpg",
    "c.jpg",
    "d.jpg",
    "e.jpg",
    "f.jpg",
    "g.jpg",
    "h.jpg",
    "i.jpg",
    "j.jpg",
    "k.jpg",
    "l.jpg",
    "m.jpg",
    "n.jpg",
    "o.jpg",
    "p.jpg",
    "q.jpg",
    "r.jpg",
]

// 文件数据
export const mkfile = Mock.mock({
    "count":64,
    "list|64":[
        {
            "id|1":0,
            "url|1":photos,
            "fileName":"@ctitle(2,12)",
            "format":"jpeg",
            "subsetId|0-4":3
        }
    ]
})