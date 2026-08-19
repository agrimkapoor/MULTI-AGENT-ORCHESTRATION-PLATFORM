import { Annotation } from "@langchain/langgraph";

//defining agent state
export const AgentState = Annotation.Root({
  prompt: Annotation(),
  conversationId: Annotation(),
  userId: Annotation(),
  agent: Annotation(),
  response: Annotation(),
  images: Annotation(),
  model: Annotation(),
  file: Annotation(),
  artifacts: Annotation(),
  searchResults: Annotation(),
  codeContext: Annotation(),
  pdfContext: Annotation()
});

/*
  When an agent performs multiple steps (e.g., search → summarize → generate answer), each step needs access to data from previous steps. The state acts as a shared memory across nodes in the LangGraph graph.

  Instead of passing many parameters between functions, all nodes read from and write to the same AgentState object.
*/
