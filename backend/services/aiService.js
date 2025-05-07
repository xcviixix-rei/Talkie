import Together from "together-ai";


import dotenv from 'dotenv';
dotenv.config();
const client = new Together({apiKey: process.env.TG_API_KEY});

async function summarizeText(processedMessages) {
  // Concatenate all message texts into a single string
  const conversationText = processedMessages
  .map(msg => `${msg.sender}: ${msg.text}`)
  .join("\n");

  const systemPrompt = `Bạn là một trợ lý tóm tắt cuộc trò chuyện.  
- Đọc lướt nội dung phía sau.  
- Nhận diện người nói và lỗi/chủ đề chính được thảo luận.  
- Viết một đoạn văn ngắn gọn (2-3 câu) tổng hợp ý chính của toàn bộ cuộc trò chuyện, không liệt kê từng lời thoại.  
- Giữ ngôn ngữ rõ ràng, trung lập và nhất quán về phong cách.  

Bây giờ, tóm tắt cuộc trò chuyện sau:`;

  let messages = [
    {
      "role": "system",
      "content": systemPrompt,
    },
    {
      "role": "user",
      "content": conversationText,
    },
  ]



  try {
    const response = await client.chat.completions.create({
      model: "Qwen/Qwen2.5-7B-Instruct-Turbo", // nhanh (0.5s) nhưng không sáng tạo.
      // model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", // 3.2s
      // model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", // 14s
      // model: "meta-llama/Meta-Llama-3-8B-Instruct-Lite", // Trả lời tiếng Anh ròi :")
      messages: messages,
      max_tokens: 256,
      temperature: 1e-6,
      top_k:1,
    });
  // console.log("Response:", response.choices[0]);
    const summary = response?.choices?.[0]?.message?.content;
    return summary || "No summary available.";
  } catch (error) {
    console.error("Error in AI summarization:", error);
    throw error;
  }
}

async function summarizeTextClarifai(processedMessages) {
  // Concatenate all message texts into a single string
  const conversationText = processedMessages
  .map(msg => `${msg.sender}: ${msg.text}`)
  .join("\n");

  const combinedText = `Bạn là một trợ lý tóm tắt cuộc trò chuyện.  
- Đọc lướt nội dung phía sau.  
- Nhận diện người nói và lỗi/chủ đề chính được thảo luận.  
- Viết một đoạn văn ngắn gọn (2-3 câu) tổng hợp ý chính của toàn bộ cuộc trò chuyện, không liệt kê từng lời thoại.  
- Giữ ngôn ngữ rõ ràng, trung lập và nhất quán về phong cách.  

Bây giờ, tóm tắt cuộc trò chuyện sau:
${conversationText}`;

  console.log("Prompt:", combinedText);

  // Load Clarifai configuration variables from .env
  const PAT = process.env.CLARIFAI_PAT;
  const USER_ID = process.env.CLARIFAI_USER_ID;
  const APP_ID = process.env.CLARIFAI_APP_ID;
  const MODEL_ID = process.env.CLARIFAI_MODEL_ID;
  const MODEL_VERSION_ID = process.env.CLARIFAI_MODEL_VERSION_ID;

  // Create the request body - here we provide the combined text to the model
  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID
    },
    inputs: [
      {
        data: {
          text: {
            raw: combinedText
          }
        }
      }
    ]
  });

  // console.log("Request body:", raw);

  const requestOptions = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Key ' + PAT
    },
    body: raw
  };

  const url = `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`;

  try {
    const response = await fetch(url, requestOptions);
    const resultText = await response.text();
    const result = JSON.parse(resultText);
    // Extract the summary from the API response.
    // Adjust extraction based on the actual response if needed.
    if (result.status.code !== 10000) {
      throw new Error(`Error from AI service: ${result.status.description}`);
    }
    const summary = result?.outputs?.[0]?.data?.text?.raw;
    return summary || "No summary available.";
  } catch (error) {
    console.error("Error in AI summarization:", error);
    throw error;
  }
}

export { summarizeText, summarizeTextClarifai };

import fetch from 'node-fetch'; // If using Node 18+, you can remove this import as fetch is global.
import { response } from "express";

async function translateText(text, fromLang, toLang) {
  const url = "https://translate.googleapis.com/translate_a/single";
  
  // Build query parameters
  const params = new URLSearchParams({
    client: "gtx",
    sl: fromLang,
    tl: toLang,
    dt: "t",
    text: text,
    op: "translate"
  });
  
  const fullUrl = `${url}?${params.toString()}`;
  
  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      // If response is not OK, simply return the original text.
      return text;
    }
    const jsonRes = await response.json();
    if (!jsonRes[0]) {
      return text;
    }
    let translatedText = "";
    for (const segment of jsonRes[0]) {
      translatedText += segment[0];
    }
    return translatedText;
  } catch (error) {
    console.error("Error in translation:", error);
    return text;
  }
}

export { translateText };


function removeOverlap(lastText, suggestion) {
  let overlap = "";
  for (let i = 0; i < lastText.length; i++) {
    let suffix = lastText.slice(i);
    if (suggestion.startsWith(suffix) && suffix.length > overlap.length) {
      overlap = suffix;
    }
  }
  if (overlap.length > 0) {
    return suggestion.slice(overlap.length).trim();
  }
  return suggestion;
}


async function suggestMessages(processedMessages) {
  // Concatenate all message texts into a single string
  const conversationText = processedMessages
  .map(msg => `${msg.sender}: ${msg.text}`)
  .join("\n");

  // If no messages are provided, return a random greeting.
  if (processedMessages.length === 0) {
    const greetings = [
      "Chào bạn! Bạn có khỏe không?",
      "Xin chào.",
      "Chào! Hy vọng bạn đang có một ngày tốt lành.",
      "Hello bạn! Bạn có muốn trò chuyện không?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  const systemPrompt = `You are given a short chat that may be either empty or end with a truncated message.  
- If the chat ends with an incomplete sentence, finish that sentence naturally as the next message.  
- If the chat is empty, propose an appropriate opening greeting to people in Vietnamese.  

Always respond with the message text only—no speaker names, quotation marks, or additional context.
`;

  let messages = [
    {
      "role": "system",
      "content": systemPrompt,
    },
    {
      "role": "user",
      "content": conversationText,
    },
  ]



  try {
    const response = await client.chat.completions.create({
      model: "Qwen/Qwen2.5-7B-Instruct-Turbo", // nhanh (0.5s) nhưng không sáng tạo.
      // model: "Qwen/Qwen2.5-72B-Instruct-Turbo", // chậm, đắt.
      // model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", // 3.2s, worst là 9s
      // model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", // 14s
      // model: "meta-llama/Meta-Llama-3-8B-Instruct-Lite", // Trả lời tiếng Anh ròi :")
      messages: messages,
      max_tokens: 32,
      temperature: 0.7,
      top_k:40,
    });
  // console.log("Response:", response.choices[0]);
    let suggestion = response?.choices?.[0]?.message?.content;
    const lastMessage = processedMessages[processedMessages.length - 1].text.trim();
    suggestion = removeOverlap(lastMessage, suggestion);

    return suggestion || "No suggestions available.";
  } catch (error) {
    console.error("Error in AI suggestion:", error);
    throw error;
  }
}

export { suggestMessages };