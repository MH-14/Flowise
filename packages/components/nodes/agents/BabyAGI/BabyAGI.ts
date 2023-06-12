import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { BabyAGI } from './core'
import { BaseChatModel } from 'langchain/chat_models/base'
import { VectorStore } from 'langchain/vectorstores'

class BabyAGI_Agents implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'BabyAGI'
        this.name = 'babyAGI'
        this.type = 'BabyAGI'
        this.category = 'Agents'
        this.icon = 'babyagi.jpg'
        this.description = '任务驱动的自主代理程序，根据目标创建新任务并重新排序任务列表'
        this.baseClasses = ['BabyAGI']
        this.inputs = [
            {
                label: '聊天模型',
                name: 'model',
                type: 'BaseChatModel'
            },
            {
                label: '向量存储',
                name: 'vectorStore',
                type: 'VectorStore'
            },
            {
                label: '任务循环',
                name: 'taskLoop',
                type: 'number',
                default: 3
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as BaseChatModel
        const vectorStore = nodeData.inputs?.vectorStore as VectorStore
        const taskLoop = nodeData.inputs?.taskLoop as string
        const k = (vectorStore as any)?.k ?? 4

        const babyAgi = BabyAGI.fromLLM(model, vectorStore, parseInt(taskLoop, 10), k)
        return babyAgi
    }

    async run(nodeData: INodeData, input: string): Promise<string> {
        const executor = nodeData.instance as BabyAGI
        const objective = input

        const res = await executor.call({ objective })
        return res
    }
}

module.exports = { nodeClass: BabyAGI_Agents }
