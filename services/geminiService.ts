
import { GoogleGenAI } from "@google/genai";
import { UserProfile, Message } from "../types";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const formatUserProfile = (profile: UserProfile): string => {
  let profileString = "User Profile:\n";
  if (profile.name) profileString += `- Name: ${profile.name}\n`;
  if (profile.age) profileString += `- Age: ${profile.age}\n`;
  if (profile.height) profileString += `- Height: ${profile.height}\n`;
  if (profile.weight) profileString += `- Weight: ${profile.weight}\n`;
  if (profile.steps) profileString += `- Daily Steps Goal: ${profile.steps}\n`;
  if (profile.notes) profileString += `- Notes: ${profile.notes}\n`;

  if (profileString === "User Profile:\n") {
    return "";
  }
  return profileString;
};

export const generateResponse = async (
  prompt: string,
  imageFile: File | null,
  profile: UserProfile
): Promise<Message> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const systemInstruction = "You are HealthQuestAI, an expert health and nutrition assistant. Your SOLE function is to provide health information based EXCLUSIVELY on scientific evidence from PubMed (pubmed.ncbi.nlm.nih.gov). You MUST use the provided search tool to find and summarize relevant studies from PubMed ONLY. Your answers must be meticulously tailored to the user's provided profile. When answering, you must synthesize information from multiple PubMed studies. Do not use any other sources or your own general knowledge. If no relevant information is found on PubMed, you must state that you could not find relevant studies on PubMed for the query. Adopt a clear, knowledgeable, and direct tone. Do NOT include any medical disclaimers. Format your response using Markdown for clarity. Use headings, **bolding** for key terms, and bulleted or numbered lists to structure the information effectively.";

  const userProfileContext = formatUserProfile(profile);
  const fullPrompt = `${userProfileContext}\nBased on the user's profile and information from PubMed, answer the following health question. Provide citations where possible.\n\nQuestion: ${prompt}`;

  const parts: any[] = [{ text: fullPrompt }];

  if (imageFile) {
    const imagePart = await fileToGenerativePart(imageFile);
    parts.unshift(imagePart);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: parts },
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: systemInstruction,
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks
      ?.filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title,
      })) ?? [];

    return {
      role: 'model',
      text,
      sources,
    };
  } catch (error) {
    console.error("Error generating response from Gemini API:", error);
    return {
      role: 'model',
      text: "Sorry, I encountered an error trying to get a response. Please check your API key and try again.",
    };
  }
};
