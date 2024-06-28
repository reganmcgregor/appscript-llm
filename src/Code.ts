/**********************************************
 * @author Patricio López Juri
 * @license MIT
 * @version 1.0.0
 * @see https://github.com/urvana/appscript-chatgpt
 */

import type {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
} from "openai/resources/chat/completions";

/** You can change this. */
const SYSTEM_PROMPT = `
  You are a helpful assistant integrated within a Google Sheets application.
  Your task is to provide accurate, concise, and user-friendly responses to user prompts.
  Whenever possible, format your answers to be compatible with Google Sheets, such as providing data in a tabular format, lists, or single cell values.
`;

/** Value for empty results */
const EMPTY = "EMPTY" as const;
/** Optional: hardcode your API key here. */
const OPENAI_API_KEY = "";
/** Private user properties storage keys. This is not the API Key itself. */
const PROPERTY_KEY_OPENAPI = "OPENAI_API_KEY" as const;
const MIME_JSON = "application/json" as const;

/**
 * Custom function to call ChatGPT API
 *
 * @param {string} prompt The prompt to send to ChatGPT. Defaults to GT3.5 Turbo model.
 * @param {string} [model='gpt-3.5-turbo'] The model to use (e.g., 'gpt-3.5-turbo', 'gpt-4')
 * @param {number} [maxTokens=150] The maximum number of tokens to return
 * @return {string} The response from ChatGPT
 * @customfunction
 */
function CHATGPT(
  prompt: string,
  model = "gpt-3.5-turbo",
  maxTokens = 150,
): string {
  const properties = PropertiesService.getUserProperties();
  const apiKey = properties.getProperty(PROPERTY_KEY_OPENAPI) || OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Use =CHATGPTKEY("YOUR_API_KEY") first. Get it from https://platform.openai.com/api-keys',
    );
  }

  const processed = String(prompt || "").trim();
  if (!processed) {
    return EMPTY;
  }

  const url = "https://api.openai.com/v1/chat/completions";

  const payload: ChatCompletionCreateParamsNonStreaming = {
    model: model,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: SYSTEM_PROMPT.trim() },
      { role: "user", content: processed },
    ],
  };

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: MIME_JSON,
    headers: {
      Accept: MIME_JSON,
      Authorization: `Bearer ${apiKey}`,
    },
    payload: JSON.stringify(payload),
  };

  const response = UrlFetchApp.fetch(url, options);
  const json = response.getContentText();
  const data = JSON.parse(json) as ChatCompletion;

  const choice = data.choices[0];
  if (choice) {
    const content = choice.message.content;
    return (content || "").trim() || EMPTY;
  }
  return EMPTY;
}

/**
 * Custom function to call ChatGPT-3 API
 *
 * @param {string} prompt The prompt to send to ChatGPT
 * @param {number} [maxTokens=150] The maximum number of tokens to return
 * @return {string} The response from ChatGPT
 * @customfunction
 */
function CHATGPT3(prompt: string, maxTokens = 150): string {
  return CHATGPT(prompt, "gpt-3.5-turbo", maxTokens);
}

/**
 * Custom function to call ChatGPT-4 API
 *
 * @param {string} prompt The prompt to send to ChatGPT
 * @param {number} [maxTokens=150] The maximum number of tokens to return
 * @return {string} The response from ChatGPT
 * @customfunction
 */
function CHATGPT4(prompt: string, maxTokens = 150): string {
  return CHATGPT(prompt, "gpt-4", maxTokens);
}

/**
 * Custom function to set the OpenAI API key
 *
 * @param {string} apiKey The OpenAI API key to save
 * @return {string} Confirmation message
 * @customfunction
 */
function CHATGPTKEY(apiKey: string): string {
  const properties = PropertiesService.getUserProperties();
  properties.setProperty("OPENAI_API_KEY", apiKey);
  return "✅ Remove this cell";
}
