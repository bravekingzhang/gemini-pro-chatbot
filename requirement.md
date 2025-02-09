# Google Gemini Chatbot

## 需求描述

用户已经初始化了 expo 移动端开发框架，并且已经安装了 openai 和 react-native-reanimated 等依赖。

用户想实现一个可以和 gemini pro 2.0 对话的 chatbot，并且可以支持流式响应，并且可以支持代码语法高亮，并且可以支持对话历史管理，自定义系统提示词。

添加消息持久化存储

实现流式响应（streaming response）

添加代码语法高亮

支持对话历史管理

实现消息编辑功能

4 个 tab 页面

1. 对话
2. agent
3. 发现
4. 设置

对话页就是和 gemini 创建的只能提对话的页面

agent 页就是可以创建多个 agent 的页面，每个 agent 可以有不同的系统提示词，并且可以有不同的对话历史

发现页就是可以利用 gemini 的 api 来生成一些有趣的内容，比如图片，视频，音频，文字等，并且可以分享给其他用户，做自媒体等等。

设置页就是可以设置一些个人信息，并且可以设置apikey，主题等。



## 一些补充文档

根据 Google 官方文档，可以谁用兼容 openai 的方式访问 gemini

### 流式响应

```js
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: "GEMINI_API_KEY",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "gemini-1.5-flash",
    messages: [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ],
    stream: true,
  });

  for await (const chunk of completion) {
    console.log(chunk.choices[0].delta.content);
  }
}

main();
```

### 图片理解

```js
import OpenAI from "openai";
import fs from 'fs/promises';

const openai = new OpenAI({
  apiKey: "GEMINI_API_KEY",
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function encodeImage(imagePath) {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error("Error encoding image:", error);
    return null;
  }
}

async function main() {
  const imagePath = "Path/to/agi/image.jpeg";
  const base64Image = await encodeImage(imagePath);

  const messages = [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What is in this image?",
        },
        {
          "type": "image_url",
          "image_url": {
            "url": `data:image/jpeg;base64,${base64Image}`
          },
        },
      ],
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gemini-2.0-pro-exp-02-05",
      messages: messages,
    });

    console.log(response.choices[0]);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
  }
}

main();
```





