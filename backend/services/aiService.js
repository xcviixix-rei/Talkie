import dotenv from 'dotenv';
dotenv.config();

async function summarizeText(processedMessages) {
  // Concatenate all message texts into a single string
  const conversationText = processedMessages
  .map(msg => `${msg.sender} said: ${msg.text}`)
  .join("\n");

  const combinedText = `Hãy tóm tắt cuộc trò chuyện sau đây một cách ngắn gọn và thân thiện. 
Cuộc trò chuyện bao gồm các tin nhắn từ nhiều người dùng với các chủ đề khác nhau. 
Hãy tập trung vào việc nắm bắt những ý chính cũng như cảm xúc quan trọng được thể hiện trong cuộc trò chuyện.
Cuộc trò chuyện:
${conversationText}`;

  // console.log("Prompt:", combinedText);

  // Load Clarifai configuration variables from .env
  const PAT = process.env.CLARIFAI_PAT;
  const USER_ID = process.env.CLARIFAI_USER_ID;
  const APP_ID = process.env.CLARIFAI_APP_ID;
  const MODEL_ID = process.env.CLARIFAI_MODEL_ID;
  const MODEL_VERSION_ID = process.env.CLARIFAI_MODEL_VERSION_ID;

  // Create the request body – here we provide the combined text to the model
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

export { summarizeText };