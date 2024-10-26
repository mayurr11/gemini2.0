import { createContext, useState } from "react";
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  const delayPara = (index, nextWord) => {
    setTimeout(() => {
      setResultData((prev) => prev + nextWord);
    }, 75 * index);
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
  };

  const formatGeminiResponse = (response) => {
    // Replace code blocks between ```
    let formattedResponse = response.replace(
      /```([^```]+)```/g,
      "<pre><code>$1</code></pre>"
    );

    // Replace inline code between `
    formattedResponse = formattedResponse.replace(
      /`([^`]+)`/g,
      "<code>$1</code>"
    );

    // Replace bold text between **
    formattedResponse = formattedResponse.replace(
      /\*\*(.*?)\*\*/g,
      "<b>$1</b>"
    );

    // Replace italic text between *
    formattedResponse = formattedResponse.replace(/\*(.*?)\*/g, "<i>$1</i>");

    // Replace headings (## for H2, ### for H3, etc.)
    formattedResponse = formattedResponse.replace(
      /(##+)\s*(.*)/g,
      (match, p1, p2) => {
        const level = p1.length; // Number of #
        return `<h${level}>${p2}</h${level}>`;
      }
    );

    // Replace bullet points (lines starting with *)
    formattedResponse = formattedResponse.replace(
      /^\*\s+(.*)/gm,
      "<li>$1</li>"
    );

    // Wrap lines starting with <li> with <ul>
    formattedResponse = formattedResponse.replace(
      /(<li>.*<\/li>)/g,
      "<ul>$1</ul>"
    );

    // Replace newline characters with <br/>
    formattedResponse = formattedResponse.replace(/\n/g, "<br/>");

    return formattedResponse;
  };

  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);
    let response;
    if (prompt !== undefined) {
      response = await runChat(prompt);
      setRecentPrompt(prompt);
    } else {
      setPrevPrompts((prev) => [...prev, input]);
      setRecentPrompt(input);
      response = await runChat(input);
    }
    const formattedResponse = formatGeminiResponse(response);

    const responseWords = formattedResponse.split(" ");
    responseWords.forEach((word, index) => {
      delayPara(index, word + " ");
    });

    setLoading(false);
    setInput("");
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    newChat,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
