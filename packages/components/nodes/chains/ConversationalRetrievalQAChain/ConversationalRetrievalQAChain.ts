import { BaseLanguageModel } from 'langchain/base_language'
import { ICommonObject, IMessage, INode, INodeData, INodeParams } from '../../../src/Interface'
import { CustomChainHandler, getBaseClasses } from '../../../src/utils'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { BaseRetriever } from 'langchain/schema'

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
                label: '系统消息',
                name: 'systemMessagePrompt',
                type: 'string',
                rows: 4,
                additionalParams: true,
                optional: true,
                placeholder:
                    '我希望你扮演一份我正在与之交谈的文件. 你的名字是“AI助手”. 你将从给定的信息中为我提供答案. 如果答案不在其中, 请准确地说“嗯, 我不确定.”然后停止回答. 拒绝回答任何与信息无关的问题. 永远不要打破角色.'
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        const vectorStoreRetriever = nodeData.inputs?.vectorStoreRetriever as BaseRetriever
        const systemMessagePrompt = nodeData.inputs?.systemMessagePrompt as string

        const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStoreRetriever, {
            verbose: process.env.DEBUG === 'true' ? true : false,
            qaTemplate: systemMessagePrompt ? `${systemMessagePrompt}\n${qa_template}` : default_qa_template
        })
        return chain
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string> {
        const chain = nodeData.instance as ConversationalRetrievalQAChain
        let model = nodeData.inputs?.model

        // Temporary fix: https://github.com/hwchase17/langchainjs/issues/754
        model.streaming = false
        chain.questionGeneratorChain.llm = model

        let chatHistory = ''

        if (options && options.chatHistory) {
            const histories: IMessage[] = options.chatHistory
            chatHistory = histories
                .map((item) => {
                    return item.message
                })
                .join('')
        }

        const obj = {
            question: input,
            chat_history: chatHistory ? chatHistory : []
        }

        if (options.socketIO && options.socketIOClientId) {
            const handler = new CustomChainHandler(options.socketIO, options.socketIOClientId)
            const res = await chain.call(obj, [handler])
            return res?.text
        } else {
            const res = await chain.call(obj)
            return res?.text
        }
    }
}

module.exports = { nodeClass: ConversationalRetrievalQAChain_Chains }
