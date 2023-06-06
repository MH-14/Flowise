import { ICommonObject, IMessage, INode, INodeData, INodeParams } from '../../../src/Interface'
import { ConversationChain } from 'langchain/chains'
import { CustomChainHandler, getBaseClasses } from '../../../src/utils'
import { ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate } from 'langchain/prompts'
import { BufferMemory, ChatMessageHistory } from 'langchain/memory'
import { BaseChatModel } from 'langchain/chat_models/base'
import { AIChatMessage, HumanChatMessage } from 'langchain/schema'

const systemMessage = `以下是一段友好的对话, 其中一方是人类, 另一方是AI. 这个AI非常健谈, 会提供很多具体的细节信息. 如果AI不知道某个问题的答案, 它会诚实地说出自己不知道.`

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
                    chatHistory.push(new AIChatMessage(message.message))
                } else if (message.type === 'userMessage') {
                    chatHistory.push(new HumanChatMessage(message.message))
                }
            }
            memory.chatHistory = new ChatMessageHistory(chatHistory)
            chain.memory = memory
        }

        if (options.socketIO && options.socketIOClientId) {
            const handler = new CustomChainHandler(options.socketIO, options.socketIOClientId)
            const res = await chain.call({ input }, [handler])
            return res?.response
        } else {
            const res = await chain.call({ input })
            return res?.response
        }
    }
}

module.exports = { nodeClass: ConversationChain_Chains }
