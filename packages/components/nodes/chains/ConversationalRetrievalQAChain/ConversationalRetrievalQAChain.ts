import { BaseLanguageModel } from 'langchain/base_language'
import { ICommonObject, IMessage, INode, INodeData, INodeParams } from '../../../src/Interface'
import { CustomChainHandler, getBaseClasses } from '../../../src/utils'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { AIChatMessage, BaseRetriever, HumanChatMessage } from 'langchain/schema'
import { BaseChatMemory, BufferMemory, ChatMessageHistory } from 'langchain/memory'
import { PromptTemplate } from 'langchain/prompts'

const default_qa_template = `请使用下面的上下文片段回答后面的问题. 如果您不知道答案，请直接说不知道，不要试图编造答案.

{context}

问题: {question}
有用的答案:`

const qa_template = `请使用下面的上下文片段回答后面的问题.

{context}

问题: {question}
有用的答案:`

class ConversationalRetrievalQAChain_Chains implements INode {
    label: string
    name: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    description: string
    inputs: INodeParams[]

    constructor() {
        this.label = 'Conversational Retrieval QA Chain'
        this.name = 'conversationalRetrievalQAChain'
        this.type = 'ConversationalRetrievalQAChain'
        this.icon = 'chain.svg'
        this.category = 'Chains'
        this.description = '文档问答(Document QA) - 基于检索问答链 (RetrievalQAChain) 构建, 提供聊天历史记录组件'
        this.baseClasses = [this.type, ...getBaseClasses(ConversationalRetrievalQAChain)]
        this.inputs = [
            {
                label: '语言模型',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: '向量存储检索器',
                name: 'vectorStoreRetriever',
                type: 'BaseRetriever'
            },
            {
                label: 'Return Source Documents',
                name: 'returnSourceDocuments',
                type: 'boolean',
                optional: true
            },
            {
                label: '系统消息',
                name: 'systemMessagePrompt',
                type: 'string',
                rows: 4,
                additionalParams: true,
                optional: true,
                placeholder:
                    '我希望你扮演一份我正在与之交谈的文件. 你的名字是“AI助手”. 你将从给定的信息中为我提供答案. 如果答案不在其中, 请准确地说“嗯, 我不确定.”然后停止回答. 拒绝回答任何与信息无关的问题. 永远不要打破角色.'
            },
            {
                label: 'Chain Option',
                name: 'chainOption',
                type: 'options',
                options: [
                    {
                        label: 'MapReduceDocumentsChain',
                        name: 'map_reduce',
                        description:
                            'Suitable for QA tasks over larger documents and can run the preprocessing step in parallel, reducing the running time'
                    },
                    {
                        label: 'RefineDocumentsChain',
                        name: 'refine',
                        description: 'Suitable for QA tasks over a large number of documents.'
                    },
                    {
                        label: 'StuffDocumentsChain',
                        name: 'stuff',
                        description: 'Suitable for QA tasks over a small number of documents.'
                    }
                ],
                additionalParams: true,
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        const vectorStoreRetriever = nodeData.inputs?.vectorStoreRetriever as BaseRetriever
        const systemMessagePrompt = nodeData.inputs?.systemMessagePrompt as string
        const returnSourceDocuments = nodeData.inputs?.returnSourceDocuments as boolean
        const chainOption = nodeData.inputs?.chainOption as string

        const obj: any = {
            verbose: process.env.DEBUG === 'true' ? true : false,
            qaChainOptions: {
                type: 'stuff',
                prompt: PromptTemplate.fromTemplate(systemMessagePrompt ? `${systemMessagePrompt}\n${qa_template}` : default_qa_template)
            },
            memory: new BufferMemory({
                memoryKey: 'chat_history',
                inputKey: 'question',
                outputKey: 'text',
                returnMessages: true
            })
        }
        if (returnSourceDocuments) obj.returnSourceDocuments = returnSourceDocuments
        if (chainOption) obj.qaChainOptions = { ...obj.qaChainOptions, type: chainOption }

        const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStoreRetriever, obj)
        return chain
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string | ICommonObject> {
        const chain = nodeData.instance as ConversationalRetrievalQAChain
        const returnSourceDocuments = nodeData.inputs?.returnSourceDocuments as boolean
        let model = nodeData.inputs?.model

        // Temporary fix: https://github.com/hwchase17/langchainjs/issues/754
        model.streaming = false
        chain.questionGeneratorChain.llm = model

        const obj = { question: input }

        if (chain.memory && options && options.chatHistory) {
            const chatHistory = []
            const histories: IMessage[] = options.chatHistory
            const memory = chain.memory as BaseChatMemory

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
            const handler = new CustomChainHandler(options.socketIO, options.socketIOClientId, undefined, returnSourceDocuments)
            const res = await chain.call(obj, [handler])
            if (res.text && res.sourceDocuments) return res
            return res?.text
        } else {
            const res = await chain.call(obj)
            if (res.text && res.sourceDocuments) return res
            return res?.text
        }
    }
}

module.exports = { nodeClass: ConversationalRetrievalQAChain_Chains }
