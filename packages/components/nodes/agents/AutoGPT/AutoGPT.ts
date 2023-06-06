import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { BaseChatModel } from 'langchain/chat_models/base'
import { AutoGPT } from 'langchain/experimental/autogpt'
import { Tool } from 'langchain/tools'
import { VectorStoreRetriever } from 'langchain/vectorstores/base'

class AutoGPT_Agents implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'AutoGPT'
        this.name = 'autoGPT'
        this.type = 'AutoGPT'
        this.category = 'Agents'
        this.icon = 'autogpt.png'
        this.description = '自主智能代理，具有自我引导任务完成的思维链'
        this.baseClasses = ['AutoGPT']
        this.inputs = [
            {
                label: '允许使用的工具',
                name: 'tools',
                type: 'Tool',
                list: true
            },
            {
                label: '聊天模型',
                name: 'model',
                type: 'BaseChatModel'
            },
            {
                label: '向量存储检索器',
                name: 'vectorStoreRetriever',
                type: 'BaseRetriever'
            },
            {
                label: 'AutoGPT 名称',
                name: 'aiName',
                type: 'string',
                placeholder: 'Tom',
                optional: true
            },
            {
                label: 'AutoGPT 角色',
                name: 'aiRole',
                type: 'string',
                placeholder: 'Assistant',
                optional: true
            },
            {
                label: '最大循环次数',
                name: 'maxLoop',
                type: 'number',
                default: 5,
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as BaseChatModel
        const vectorStoreRetriever = nodeData.inputs?.vectorStoreRetriever as VectorStoreRetriever
        let tools = nodeData.inputs?.tools as Tool[]
        tools = tools.flat()
        const aiName = (nodeData.inputs?.aiName as string) || 'AutoGPT'
        const aiRole = (nodeData.inputs?.aiRole as string) || 'Assistant'
        const maxLoop = nodeData.inputs?.maxLoop as string

        const autogpt = AutoGPT.fromLLMAndTools(model, tools, {
            memory: vectorStoreRetriever,
            aiName,
            aiRole
        })

        autogpt.maxIterations = parseInt(maxLoop, 10)

        return autogpt
    }

    async run(nodeData: INodeData, input: string): Promise<string> {
        const executor = nodeData.instance as AutoGPT
        try {
            const res = await executor.run([input])
            return res || '我已经完成了所有任务.'
        } catch (e) {
            console.error(e)
            throw new Error(e)
        }
    }
}

module.exports = { nodeClass: AutoGPT_Agents }
