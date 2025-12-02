---
title: SimpleExam
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# SimpleExam

Base URLs:

# Authentication

- HTTP Authentication, scheme: bearer

# 管理端

## POST 登陆管理员账号

POST /api/v1/admin/login

> Body 请求参数

```json
{
  "username": "admin",
  "password": "123456"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 否 |none|
|» username|body|string| 是 |none|
|» password|body|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImV4cCI6MTc0ODI1Mzg1OCwiaWF0IjoxNzQ4MjUzNzk4fQ.PFio0tEz5WqbynJuMDhJAYquoK3-s-b230ygYEw_33E",
    "user": {
      "avatar": "https://img.imwlw.com/i/2024/11/15/67370c8463ee5.png",
      "id": 2,
      "nickname": "ADMIN",
      "username": "admin"
    }
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» token|string|true|none||none|
|»» user|object|true|none||none|
|»»» avatar|string|true|none||none|
|»»» id|integer|true|none||none|
|»»» nickname|string|true|none||none|
|»»» username|string|true|none||none|

# 管理端/用户管理

## GET 获取用户列表

GET /api/v1/admin/users

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|page|query|string| 否 |none|
|size|query|string| 否 |none|
|keyword|query|string| 否 |none|
|is_admin|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJwrX75MKIqibepGgf0AmZe3P6uSVabK4aiaJcI9RzVImBTmwWfNMC8h8f6DLmgIfs3toAEVjvlHoAw/132",
        "city": "",
        "country": "",
        "created_at": "2025-05-27T20:31:10.414+08:00",
        "id": 27,
        "is_admin": false,
        "nickname": "小宋茶庄(家庭健康管理员)",
        "open_id": "oxhQv6WTWLCXWLighvARNz83KU7A",
        "province": "",
        "sex": 0,
        "union_id": "",
        "updated_at": "2025-05-27T20:31:10.414+08:00",
        "username": "wx_oxhQv6WT"
      },
      {
        "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/Q3auHgzwzM6vmKyVjL0q2oSkwiaTsDWAA7RZHMjApEtHDt6fXjTibpFchtQ0bicuXRSku3g2iaJR8AkNibeUERdmdxA/132",
        "city": "",
        "country": "",
        "created_at": "2025-05-27T20:30:24.953+08:00",
        "id": 26,
        "is_admin": false,
        "nickname": "微信用户",
        "open_id": "oxhQv6Wkud4PZRCu_gX2Yov0lBXo",
        "province": "",
        "sex": 0,
        "union_id": "",
        "updated_at": "2025-05-27T20:31:03.161+08:00",
        "username": "wx_oxhQv6Wk"
      },
      {
        "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/952hPjHqMedgsZZYeysYD784co9YoxxmNKKDdGBXLqHIL8NmXnX7S5rHgYUrsg50DMJWib3HlEkx94pvFssnpMJHX7eZUxB3qgEsFqpt4iaJ8/132",
        "city": "",
        "country": "",
        "created_at": "2025-05-27T20:27:51.207+08:00",
        "id": 25,
        "is_admin": false,
        "nickname": "FrontierWang",
        "open_id": "oxhQv6RWzpJHufE-C1zL1srmy1ac",
        "province": "",
        "sex": 0,
        "union_id": "",
        "updated_at": "2025-05-27T20:27:51.207+08:00",
        "username": "wx_oxhQv6RW"
      },
      {
        "avatar": "https://img.imwlw.com/i/2024/11/15/67370c8463ee5.png",
        "city": "",
        "country": "",
        "created_at": "2025-03-24T17:06:37.265+08:00",
        "id": 2,
        "is_admin": true,
        "nickname": "ADMIN",
        "open_id": "",
        "province": "",
        "sex": 0,
        "union_id": "",
        "updated_at": "2025-03-24T17:06:37.265+08:00",
        "username": "admin"
      },
      {
        "avatar": "https://img.imwlw.com/i/2024/11/15/67370c8463ee5.png",
        "city": "",
        "country": "",
        "created_at": "2025-03-24T16:54:55.411+08:00",
        "id": 1,
        "is_admin": false,
        "nickname": "测试用户",
        "open_id": "",
        "province": "",
        "sex": 0,
        "union_id": "",
        "updated_at": "2025-03-24T16:54:55.411+08:00",
        "username": "test"
      }
    ],
    "total": 5
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» items|[object]|true|none||none|
|»»» avatar|string|true|none||none|
|»»» city|string|true|none||none|
|»»» country|string|true|none||none|
|»»» created_at|string|true|none||none|
|»»» id|integer|true|none||none|
|»»» is_admin|boolean|true|none||none|
|»»» nickname|string|true|none||none|
|»»» open_id|string|true|none||none|
|»»» province|string|true|none||none|
|»»» sex|integer|true|none||none|
|»»» union_id|string|true|none||none|
|»»» updated_at|string|true|none||none|
|»»» username|string|true|none||none|
|»» total|integer|true|none||none|

## GET 获取单个用户

GET /api/v1/admin/users/{uid}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|uid|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "avatar": "https://img.imwlw.com/i/2024/11/15/67370c8463ee5.png",
    "city": "",
    "country": "",
    "created_at": "2025-03-24T16:54:55.411+08:00",
    "id": 1,
    "is_admin": false,
    "nickname": "测试用户",
    "open_id": "",
    "province": "",
    "sex": 0,
    "union_id": "",
    "updated_at": "2025-03-24T16:54:55.411+08:00",
    "username": "test"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» avatar|string|true|none||none|
|»» city|string|true|none||none|
|»» country|string|true|none||none|
|»» created_at|string|true|none||none|
|»» id|integer|true|none||none|
|»» is_admin|boolean|true|none||none|
|»» nickname|string|true|none||none|
|»» open_id|string|true|none||none|
|»» province|string|true|none||none|
|»» sex|integer|true|none||none|
|»» union_id|string|true|none||none|
|»» updated_at|string|true|none||none|
|»» username|string|true|none||none|

## PUT 更新用户

PUT /api/v1/admin/users/{uid}

> Body 请求参数

```json
{
  "username": "郑勇",
  "password": "ipsum",
  "nickname": "程磊",
  "avatar": "http://dummyimage.com/100x100",
  "sex": 1,
  "country": "incididunt ad laborum ea mollit",
  "province": "山西省",
  "city": "香港岛",
  "is_admin": false
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|uid|path|string| 是 |none|
|body|body|object| 否 |none|
|» username|body|string| 是 |none|
|» password|body|string| 是 |none|
|» nickname|body|string| 是 |none|
|» avatar|body|string| 是 |none|
|» sex|body|integer| 是 |none|
|» country|body|string| 是 |none|
|» province|body|string| 是 |none|
|» city|body|string| 是 |none|
|» is_admin|body|boolean| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "msg": "更新成功"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» msg|string|true|none||none|

## DELETE 删除用户

DELETE /api/v1/admin/users/{uid}

> Body 请求参数

```json
{}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|uid|path|string| 是 |none|
|body|body|object| 否 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "msg": "删除成功"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» msg|string|true|none||none|

## POST 创建用户

POST /api/v1/admin/users/

> Body 请求参数

```json
{
  "username": "曾丽",
  "password": "consequat quis mollit ut",
  "nickname": "罗芳",
  "avatar": "http://dummyimage.com/100x100",
  "sex": 1,
  "country": "irure consectetur sint culpa",
  "province": "贵州省",
  "city": "滁州市",
  "is_admin": true
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 否 |none|
|» username|body|string| 是 |none|
|» password|body|string| 是 |none|
|» nickname|body|string| 是 |none|
|» avatar|body|string| 是 |none|
|» sex|body|integer| 是 |none|
|» country|body|string| 是 |none|
|» province|body|string| 是 |none|
|» city|body|string| 是 |none|
|» is_admin|body|boolean| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "id": 29
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» id|integer|true|none||none|

# 管理端/订单管理

## GET 获取订单列表

GET /api/v1/admin/orders

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|page|query|string| 否 |none|
|size|query|string| 否 |none|
|order_no|query|string| 否 |none|
|username|query|string| 否 |none|
|status|query|string| 否 |none|
|payment_type|query|string| 否 |none|
|start_time|query|string| 否 |none|
|end_time|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## POST 创建订单

POST /api/v1/admin/orders

> Body 请求参数

```json
{
  "username": "admin",
  "password": "123456"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 否 |none|
|» user_id|body|integer| 是 |none|
|» amount|body|integer| 是 |none|
|» course_id|body|integer| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "id": 5,
    "order_no": "202505281758561"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» id|integer|true|none||none|
|»» order_no|string|true|none||none|

## GET 获取单个用户订单

GET /api/v1/admin/orders/{id}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "amount": 0.01,
    "course_id": 2,
    "course_name": "新培-建筑焊工",
    "created_at": "2025-05-28T17:39:23.344+08:00",
    "expire_time": null,
    "id": 4,
    "order_no": "2025052817392331",
    "pay_time": null,
    "payment_type": "",
    "status": "unpaid",
    "user": {
      "id": 31,
      "nickname": "FrontierWang",
      "username": "wx_oxhQv6RW"
    }
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» amount|number|true|none||none|
|»» course_id|integer|true|none||none|
|»» course_name|string|true|none||none|
|»» created_at|string|true|none||none|
|»» expire_time|null|true|none||none|
|»» id|integer|true|none||none|
|»» order_no|string|true|none||none|
|»» pay_time|null|true|none||none|
|»» payment_type|string|true|none||none|
|»» status|string|true|none||none|
|»» user|object|true|none||none|
|»»» id|integer|true|none||none|
|»»» nickname|string|true|none||none|
|»»» username|string|true|none||none|

## PUT 更新订单

PUT /api/v1/admin/orders/{id}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "amount": 0.01,
    "course_id": 2,
    "course_name": "新培-建筑焊工",
    "created_at": "2025-05-28T17:39:23.344+08:00",
    "expire_time": null,
    "id": 4,
    "order_no": "2025052817392331",
    "pay_time": null,
    "payment_type": "",
    "status": "unpaid",
    "user": {
      "id": 31,
      "nickname": "FrontierWang",
      "username": "wx_oxhQv6RW"
    }
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» amount|number|true|none||none|
|»» course_id|integer|true|none||none|
|»» course_name|string|true|none||none|
|»» created_at|string|true|none||none|
|»» expire_time|null|true|none||none|
|»» id|integer|true|none||none|
|»» order_no|string|true|none||none|
|»» pay_time|null|true|none||none|
|»» payment_type|string|true|none||none|
|»» status|string|true|none||none|
|»» user|object|true|none||none|
|»»» id|integer|true|none||none|
|»»» nickname|string|true|none||none|
|»»» username|string|true|none||none|

## DELETE 删除订单

DELETE /api/v1/admin/orders/{id}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "amount": 0.01,
    "course_id": 2,
    "course_name": "新培-建筑焊工",
    "created_at": "2025-05-28T17:39:23.344+08:00",
    "expire_time": null,
    "id": 4,
    "order_no": "2025052817392331",
    "pay_time": null,
    "payment_type": "",
    "status": "unpaid",
    "user": {
      "id": 31,
      "nickname": "FrontierWang",
      "username": "wx_oxhQv6RW"
    }
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» amount|number|true|none||none|
|»» course_id|integer|true|none||none|
|»» course_name|string|true|none||none|
|»» created_at|string|true|none||none|
|»» expire_time|null|true|none||none|
|»» id|integer|true|none||none|
|»» order_no|string|true|none||none|
|»» pay_time|null|true|none||none|
|»» payment_type|string|true|none||none|
|»» status|string|true|none||none|
|»» user|object|true|none||none|
|»»» id|integer|true|none||none|
|»»» nickname|string|true|none||none|
|»»» username|string|true|none||none|

# 管理端/课程管理

## GET 获取课程列表

GET /api/v1/admin/courses

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|page|query|integer| 否 |none|
|size|query|integer| 否 |none|
|keyword|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "category_level1": "江苏省建筑施工特种作业人员考试",
        "category_level2": "新培",
        "category_sort1": 2,
        "category_sort2": 3,
        "cover": "https://example.com/new-cover.jpg",
        "description": "更新后的课程描述",
        "expire_days": 60,
        "id": 10,
        "name": "施工升降机（新版）",
        "price": 1,
        "sort": 6
      },
      {
        "category_level1": "江苏省建筑施工特种作业人员考试",
        "category_level2": "新培",
        "category_sort1": 2,
        "category_sort2": 4,
        "cover": "https://example.com/python-data.jpg",
        "description": "桩机操作工培训",
        "expire_days": 30,
        "id": 4,
        "name": "桩机操作工",
        "price": 0,
        "sort": 4
      },
      {
        "category_level1": "江苏省建筑施工特种作业人员考试",
        "category_level2": "新培",
        "category_sort1": 3,
        "category_sort2": 3,
        "cover": "https://example.com/python-data.jpg",
        "description": "建筑架子工培训",
        "expire_days": 30,
        "id": 3,
        "name": "建筑架子工",
        "price": 0.01,
        "sort": 3
      },
      {
        "category_level1": "江苏省建筑施工特种作业人员考试",
        "category_level2": "新培",
        "category_sort1": 4,
        "category_sort2": 2,
        "cover": "https://example.com/python-data.jpg",
        "description": "建筑焊工培训",
        "expire_days": 30,
        "id": 2,
        "name": "建筑焊工",
        "price": 0.01,
        "sort": 2
      },
      {
        "category_level1": "江苏省建筑施工特种作业人员考试",
        "category_level2": "新培",
        "category_sort1": 5,
        "category_sort2": 1,
        "cover": "https://example.com/go-basic.jpg",
        "description": "建筑电工培训",
        "expire_days": 30,
        "id": 1,
        "name": "建筑电工",
        "price": 0.01,
        "sort": 1
      }
    ],
    "total": 5
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» items|[object]|true|none||none|
|»»» category_level1|string|true|none||none|
|»»» category_level2|string|true|none||none|
|»»» category_sort1|integer|true|none||none|
|»»» category_sort2|integer|true|none||none|
|»»» cover|string|true|none||none|
|»»» description|string|true|none||none|
|»»» expire_days|integer|true|none||none|
|»»» id|integer|true|none||none|
|»»» name|string|true|none||none|
|»»» price|integer|true|none||none|
|»»» sort|integer|true|none||none|
|»» total|integer|true|none||none|

## POST 创建课程

POST /api/v1/admin/courses

> Body 请求参数

```json
{
  "name": "施工升降机",
  "description": "金机按按值术点层目压入全工受铁日装。",
  "price": 1,
  "category_level2": "新培",
  "category_level1": "江苏省建筑施工特种作业人员考试",
  "cover": "https://example.com/python-data.jpg",
  "expire_days": 30,
  "sort": 5,
  "category_sort1": 1,
  "category_sort2": 1,
  "exam_config": [
    {
      "type": "single",
      "count": 20,
      "score": 2
    },
    {
      "type": "multiple",
      "count": 15,
      "score": 2
    },
    {
      "type": "judge",
      "count": 15,
      "score": 2
    }
  ],
  "mock_exam_config": {
    "min": 1,
    "count": 50,
    "score": 60
  }
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 否 |none|
|» name|body|string| 是 |none|
|» cover|body|string| 是 |none|
|» category_level1|body|string| 是 |none|
|» category_level2|body|string| 是 |none|
|» price|body|integer| 是 |none|
|» description|body|string| 是 |none|
|» expire_days|body|integer| 是 |none|
|» sort|body|integer| 是 |none|
|» category_sort1|body|integer| 是 |none|
|» category_sort2|body|integer| 是 |none|
|» exam_config|body|[object]| 是 |none|
|»» type|body|string| 是 |none|
|»» count|body|integer| 是 |none|
|»» score|body|integer| 是 |none|
|» mock_exam_config|body|object| 是 |none|
|»» min|body|integer| 是 |none|
|»» count|body|integer| 是 |none|
|»» score|body|integer| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "id": 10
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» id|integer|true|none||none|
|»» order_no|string|true|none||none|

## GET 获取单个课程

GET /api/v1/admin/courses/{id}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "category_level1": "江苏省建筑施工特种作业人员考试",
    "category_level2": "新培",
    "category_sort1": 2,
    "category_sort2": 3,
    "cover": "https://example.com/new-cover.jpg",
    "description": "更新后的课程描述",
    "exam_config": "[{\"type\": \"single\", \"count\": 25, \"score\": 2}, {\"type\": \"multiple\", \"count\": 20, \"score\": 2}, {\"type\": \"judge\", \"count\": 10, \"score\": 2}]",
    "expire_days": 60,
    "id": 10,
    "mock_exam_config": "{\"min\": 2, \"count\": 60, \"score\": 70}",
    "name": "施工升降机（新版）",
    "price": 0,
    "sort": 6
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» category_level1|string|true|none||none|
|»» category_level2|string|true|none||none|
|»» category_sort1|integer|true|none||none|
|»» category_sort2|integer|true|none||none|
|»» cover|string|true|none||none|
|»» description|string|true|none||none|
|»» exam_config|[object]|true|none||none|
|»»» type|string|true|none||none|
|»»» count|integer|true|none||none|
|»»» score|integer|true|none||none|
|»» expire_days|integer|true|none||none|
|»» id|integer|true|none||none|
|»» mock_exam_config|object|true|none||none|
|»»» min|integer|true|none||none|
|»»» count|integer|true|none||none|
|»»» score|integer|true|none||none|
|»» name|string|true|none||none|
|»» price|number|true|none||none|
|»» sort|integer|true|none||none|

## PUT 更新课程

PUT /api/v1/admin/courses/{id}

> Body 请求参数

```json
{
  "name": "施工升降机（新版）",
  "description": "更新后的课程描述",
  "price": 0,
  "category_level2": "新培",
  "category_level1": "江苏省建筑施工特种作业人员考试",
  "cover": "https://example.com/new-cover.jpg",
  "expire_days": 60,
  "sort": 6,
  "category_sort1": 2,
  "category_sort2": 3,
  "exam_config": [
    {
      "type": "single",
      "count": 25,
      "score": 2
    },
    {
      "type": "multiple",
      "count": 20,
      "score": 2
    },
    {
      "type": "judge",
      "count": 10,
      "score": 2
    }
  ],
  "mock_exam_config": {
    "min": 2,
    "count": 60,
    "score": 70
  }
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|id|path|string| 是 |none|
|body|body|object| 否 |none|
|» name|body|string| 是 |none|
|» description|body|string| 是 |none|
|» price|body|integer| 是 |none|
|» category_level2|body|string| 是 |none|
|» category_level1|body|string| 是 |none|
|» cover|body|string| 是 |none|
|» expire_days|body|integer| 是 |none|
|» sort|body|integer| 是 |none|
|» category_sort1|body|integer| 是 |none|
|» category_sort2|body|integer| 是 |none|
|» exam_config|body|[object]| 是 |none|
|»» type|body|string| 是 |none|
|»» count|body|integer| 是 |none|
|»» score|body|integer| 是 |none|
|» mock_exam_config|body|object| 是 |none|
|»» min|body|integer| 是 |none|
|»» count|body|integer| 是 |none|
|»» score|body|integer| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "msg": "更新成功"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» msg|string|true|none||none|

## DELETE 删除课程

DELETE /api/v1/admin/courses/{id}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|id|path|integer| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "msg": "删除成功"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» msg|string|true|none||none|

# 管理端/卡券管理

## POST 创建卡券

POST /api/v1/admin/cards

> Body 请求参数

```json
{
  "course_id": 0,
  "amount": 0,
  "total": 0,
  "expire_days": 0
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 否 |none|
|» course_id|body|integer| 是 |none|
|» amount|body|integer| 是 |none|
|» total|body|integer| 是 |none|
|» expire_days|body|integer| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "card_no": "ypIzAhL7vjYgcZdoqg",
    "id": 1
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» card_no|string|true|none||none|
|»» id|integer|true|none||none|

## GET 获取卡券列表

GET /api/v1/admin/cards

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|page|query|string| 否 |none|
|size|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "amount": 0,
        "card_no": "ypIzAhL7vjYgcZdoqg",
        "course_id": 1,
        "course_name": "建筑起重信号司索工",
        "created_at": "2025-06-29T21:01:32.204+08:00",
        "expire_days": 30,
        "expire_time": "2025-07-29T21:01:32.204+08:00",
        "id": 1,
        "is_expired": false,
        "total": 100,
        "used": 0
      }
    ],
    "total": 1
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» items|[object]|true|none||none|
|»»» amount|integer|false|none||none|
|»»» card_no|string|false|none||none|
|»»» course_id|integer|false|none||none|
|»»» course_name|string|false|none||none|
|»»» created_at|string|false|none||none|
|»»» expire_days|integer|false|none||none|
|»»» expire_time|string|false|none||none|
|»»» id|integer|false|none||none|
|»»» is_expired|boolean|false|none||none|
|»»» total|integer|false|none||none|
|»»» used|integer|false|none||none|
|»» total|integer|true|none||none|

## GET 获取单个卡券

GET /api/v1/admin/cards/{id}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "amount": 0,
    "card_no": "ypIzAhL7vjYgcZdoqg",
    "course_id": 1,
    "course_name": "建筑起重信号司索工",
    "created_at": "2025-06-29T21:01:32.204+08:00",
    "expire_days": 30,
    "expire_time": "2025-07-29T21:01:32.204+08:00",
    "id": 1,
    "is_expired": false,
    "records": [],
    "total": 100,
    "used": 0
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» amount|integer|true|none||none|
|»» card_no|string|true|none||none|
|»» course_id|integer|true|none||none|
|»» course_name|string|true|none||none|
|»» created_at|string|true|none||none|
|»» expire_days|integer|true|none||none|
|»» expire_time|string|true|none||none|
|»» id|integer|true|none||none|
|»» is_expired|boolean|true|none||none|
|»» records|[string]|true|none||none|
|»» total|integer|true|none||none|
|»» used|integer|true|none||none|

## PUT 更新卡券

PUT /api/v1/admin/cards/{id}

> Body 请求参数

```json
{
  "course_id": 0,
  "amount": 0,
  "total": 0,
  "expire_days": 0
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|id|path|integer| 是 |none|
|body|body|object| 否 |none|
|» course_id|body|integer| 是 |none|
|» amount|body|integer| 是 |none|
|» total|body|integer| 是 |none|
|» expire_days|body|integer| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "card_no": "ypIzAhL7vjYgcZdoqg",
    "id": 1
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» card_no|string|true|none||none|
|»» id|integer|true|none||none|

## DELETE 删除卡券

DELETE /api/v1/admin/cards/{id}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "amount": 0,
    "card_no": "ypIzAhL7vjYgcZdoqg",
    "course_id": 1,
    "course_name": "建筑起重信号司索工",
    "created_at": "2025-06-29T21:01:32.204+08:00",
    "expire_days": 30,
    "expire_time": "2025-07-29T21:01:32.204+08:00",
    "id": 1,
    "is_expired": false,
    "records": [],
    "total": 100,
    "used": 0
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» amount|integer|true|none||none|
|»» card_no|string|true|none||none|
|»» course_id|integer|true|none||none|
|»» course_name|string|true|none||none|
|»» created_at|string|true|none||none|
|»» expire_days|integer|true|none||none|
|»» expire_time|string|true|none||none|
|»» id|integer|true|none||none|
|»» is_expired|boolean|true|none||none|
|»» records|[string]|true|none||none|
|»» total|integer|true|none||none|
|»» used|integer|true|none||none|

## GET 获取所有卡券兑换记录

GET /api/v1/admin/cards/records

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|page|query|string| 否 |none|
|size|query|string| 否 |none|
|card_no|query|string| 否 |none|
|username|query|string| 否 |none|
|course_id|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "amount": 0,
        "card_no": "ypIzAhL7vjYgcZdoqg",
        "course_id": 1,
        "course_name": "建筑起重信号司索工",
        "created_at": "2025-06-29T21:01:32.204+08:00",
        "expire_days": 30,
        "expire_time": "2025-07-29T21:01:32.204+08:00",
        "id": 1,
        "is_expired": false,
        "total": 100,
        "used": 0
      }
    ],
    "total": 1
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|object|true|none||none|
|»» items|[object]|true|none||none|
|»»» amount|integer|false|none||none|
|»»» card_no|string|false|none||none|
|»»» course_id|integer|false|none||none|
|»»» course_name|string|false|none||none|
|»»» created_at|string|false|none||none|
|»»» expire_days|integer|false|none||none|
|»»» expire_time|string|false|none||none|
|»»» id|integer|false|none||none|
|»»» is_expired|boolean|false|none||none|
|»»» total|integer|false|none||none|
|»»» used|integer|false|none||none|
|»» total|integer|true|none||none|

## GET 获取单个卡券兑换记录

GET /api/v1/admin/cards/{id}/records

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|id|path|string| 是 |none|
|page|query|string| 否 |none|
|size|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "amount": 0,
        "card_no": "ypIzAhL7vjYgcZdoqg",
        "course_id": 1,
        "course_name": "建筑起重信号司索工",
        "created_at": "2025-06-29T21:01:32.204+08:00",
        "expire_days": 30,
        "expire_time": "2025-07-29T21:01:32.204+08:00",
        "id": 1,
        "is_expired": false,
        "total": 100,
        "used": 0
      }
    ],
    "total": 1
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» data|[object]|true|none||none|
|»» amount|integer|true|none||none|
|»» course_id|integer|true|none||none|
|»» course_name|string|true|none||none|
|»» created_at|string|true|none||none|
|»» id|integer|true|none||none|
|»» nickname|string|true|none||none|
|»» order_id|integer|true|none||none|
|»» order_no|string|true|none||none|
|»» user_id|integer|true|none||none|
|»» username|string|true|none||none|