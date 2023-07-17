import { ICommonObject, IMessage, INode, INodeData, INodeParams } from '../../../src/Interface'
import { ConversationChain } from 'langchain/chains'
import { getBaseClasses } from '../../../src/utils'
import { ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate } from 'langchain/prompts'
import { BufferMemory, ChatMessageHistory } from 'langchain/memory'
import { BaseChatModel } from 'langchain/chat_models/base'
import { AIMessage, HumanMessage } from 'langchain/schema'
import { ConsoleCallbackHandler, CustomChainHandler } from '../../../src/handler'
import { flatten } from 'lodash'
import { Document } from 'langchain/document'

let systemMessage = `以下是人与AI之间的友好对话。AI很健谈,会提供很多根据上下文猜测的具体细节。如果AI不知道问题的答案,它会诚实地说不知道。`

class ConversationChain_Chains implements INode {
    label: string
    name: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    description: string
    inputs: INodeParams[]

    constructor() {
        this.label = 'Conversation Chain'
        this.name = 'conversationChain'
        this.type = 'ConversationChain'
        this.icon = 'chain.svg'
        this.category = 'Chains'
        this.description = '具有记忆功能的聊天模型, 可以指定特定的对话Chain'
        this.baseClasses = [this.type, ...getBaseClasses(ConversationChain)]
        this.inputs = [
            {
                label: '语言模型',
                name: 'model',
                type: 'BaseChatModel'
            },
            {
                label: '记忆',
                name: 'memory',
                type: 'BaseMemory'
            },
            {
                label: '文档',
                name: 'document',
                type: 'Document',
                description: '将整个文档内容纳入上下文窗口',
                optional: true,
                list: true
            },
            {
                label: '系统消息',
                name: 'systemMessagePrompt',
                type: 'string',
                rows: 4,
                additionalParams: true,
                optional: true,
                placeholder: '你是一个能够编写代码的有用的助手.'
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as BaseChatModel
        const memory = nodeData.inputs?.memory as BufferMemory
        const prompt = nodeData.inputs?.systemMessagePrompt as string
        const docs = nodeData.inputs?.document as Document[]

        const flattenDocs = docs && docs.length ? flatten(docs) : []
        const finalDocs = []
        for (let i = 0; i < flattenDocs.length; i += 1) {
            finalDocs.push(new Document(flattenDocs[i]))
        }

        let finalText = ''
        for (let i = 0; i < finalDocs.length; i += 1) {
            finalText += finalDocs[i].pageContent
        }

        if (finalText) systemMessage = `${systemMessage}\nThe AI has the following context:\n${finalText}`

        const obj: any = {
            llm: model,
            memory,
            verbose: process.env.DEBUG === 'true' ? true : false
        }

        const chatPrompt = ChatPromptTemplate.fromPromptMessages([
            SystemMessagePromptTemplate.fromTemplate(prompt ? `${prompt}\n${systemMessage}` : systemMessage),
            new MessagesPlaceholder(memory.memoryKey ?? 'chat_history'),
            HumanMessagePromptTemplate.fromTemplate('{input}')
        ])
        obj.prompt = chatPrompt

        const chain = new ConversationChain(obj)
        return chain
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string> {
        const chain = nodeData.instance as ConversationChain
        const memory = nodeData.inputs?.memory as BufferMemory

        if (options && options.chatHistory) {
            const chatHistory = []
            const histories: IMessage[] = options.chatHistory

            for (const message of histories) {
                if (message.type === 'apiMessage') {
                    chatHistory.push(new AIMessage(message.message))
                } else if (message.type === 'userMessage') {
                    chatHistory.push(new HumanMessage(message.message))
                }
            }
            memory.chatHistory = new ChatMessageHistory(chatHistory)
            chain.memory = memory
        }

        const loggerHandler = new ConsoleCallbackHandler(options.logger)

        if (options.socketIO && options.socketIOClientId) {
            const handler = new CustomChainHandler(options.socketIO, options.socketIOClientId)
            const res = await chain.call({ input }, [loggerHandler, handler])
            return res?.response
        } else {
            const res = await chain.call({ input }, [loggerHandler])
            return res?.response
        }
    }
}

module.exports = { nodeClass: ConversationChain_Chains }
