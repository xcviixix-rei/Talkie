export const translate = async (text, from, to) => {
  try {
    const response = await fetch(`http://10.0.2.2:5000/api/ai/translate/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        fromLanguage: from,
        targetLanguage: to,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch conversation failed:", error);
    throw error;
  }
};
