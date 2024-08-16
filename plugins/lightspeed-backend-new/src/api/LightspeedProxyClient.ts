import {
  ConfigApi,
  createApiRef,
  IdentityApi,
} from '@backstage/core-plugin-api';

import { ChatOpenAI } from "@langchain/openai";
import { MessageContent, HumanMessage, AIMessage, SystemMessage, AIMessageChunk } from "@langchain/core/messages";
import {ChatPromptTemplate, MessagesPlaceholder} from "@langchain/core/prompts";

// import { END, MessageGraph } from "@langchain/langgraph";

// import OpenAI from 'openai';
// import { Stream } from 'openai/streaming';



export type LightspeedAPI = {
  createChatCompletions: (
    prompt: string,
  ) => Promise<MessageContent> ; // => Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>>;
};

export const lightspeedApiRef = createApiRef<LightspeedAPI>({
  id: 'plugin.lightspeed.service',
});

export type Options = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

export class LightspeedProxyClient implements LightspeedAPI {
  // @ts-ignore
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;
  // private readonly openAIApi: ChatOpenAI;

  constructor(options: Options) {
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
    // this.discoveryApi = options.discoveryApi;
    // this.openAIApi = new OpenAI({
    //   baseURL: `${this.configApi.getString('backend.baseUrl')}/api/proxy/lightspeed/api`,

    //   // required but ignored
    //   apiKey: 'random-key',
    //   dangerouslyAllowBrowser: true,
    // });

  }

  async getUserAuthorization() {
    const { token: idToken } = await this.identityApi.getCredentials();
    return idToken;
  }

  async createChatCompletions(message: string) {
    const idToken = await this.getUserAuthorization();
    const openAIApi = new ChatOpenAI({
      apiKey:"sk-no-key-required",
      model: "instructlab/granite-7b-lab",
      modelName: "instructlab/granite-7b-lab",
      streaming: false,
      temperature: 0 , 
      configuration: { 
        baseOptions: {
          headers: {
            ...(idToken && { Authorization: `Bearer ${idToken}` }),
          },
        },
        apiKey:"sk-no-key-required",
        baseURL: `${this.configApi.getString('backend.baseUrl')}/api/proxy/lightspeed/api`
      }
      // callbacks=[StreamlitCallbackHandler(st.empty(),yarn add @langchain/openai
      //                                     expand_new_thoughts=True,
      //                                     collapse_completed_thoughts=True)]
      });

      const prompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          "You are a helpful assistant that can answer question in Red Hat Developer Hub.",
        ],
        new MessagesPlaceholder("messages"),
      ]);
    


  
  const chain = prompt.pipe(openAIApi);

  const response = await chain.invoke({
    messages: [
      new HumanMessage(
        message
      ),
    ],
  });
  console.log("Response: ", response.content);
  return response.content
    // configuration: {
    //   baseOptions: {
    //     headers: {
    //       ...(idToken && { Authorization: `Bearer ${idToken}` }),
    //     },
    //   },
    //   baseURL: `${this.configApi.getString('backend.baseUrl')}/api/proxy/lightspeed/api`
    // }
    // const response = await chat.call([new HumanMessage(prompt)]);
    //   console.log("Response: %o", response);
    // if (!response.content) {
    //   throw new Error("Failed to get response from OpenAI");
    // }
    // return response.content;
    
    // return await this.openAIApi.chat.completions.create(
    //   {
    //     messages: [
    //       {
    //         role: 'system',
    //         content:
    //           'You are a helpful assistant that can answer question in Red Hat Developer Hub.',
    //       },
    //       { role: 'user', content: prompt },
    //     ],
    //     model: 'instructlab/granite-7b-lab',
    //     stream: true,
    //   },
    //   {
    //     headers: {
    //       ...(idToken && { Authorization: `Bearer ${idToken}` }),
    //     },
    //   },
    // );
  }
}
