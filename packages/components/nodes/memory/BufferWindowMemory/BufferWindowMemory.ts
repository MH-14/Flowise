import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { BufferWindowMemory, BufferWindowMemoryInput } from 'langchain/memory'

class BufferWindowMemory_Memory implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Buffer Window Memory'
        this.name = 'bufferWindowMemory'
        this.type = 'BufferWindowMemory'
        this.icon = 'memory.svg'
        this.category = 'Memory'
        this.description = '将k作为窗口期大小, 提取窗口期对话作为记忆存储'
        this.baseClasses = [this.type, ...getBaseClasses(BufferWindowMemory)]
        this.inputs = [
            {
                label: '记忆标识',
                name: 'memoryKey',
                type: 'string',
                default: 'chat_history'
            },
            {
                label: '输入标识',
                name: 'inputKey',
                type: 'string',
                default: 'input'
            },
            {
                label: '窗口期大小',
                name: 'k',
                type: 'number',
                default: '4',
                description: '用于提取对话的窗口期大小'
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const memoryKey = nodeData.inputs?.memoryKey as string
        const inputKey = nodeData.inputs?.inputKey as string
        const k = nodeData.inputs?.k as string

        const obj: Partial<BufferWindowMemoryInput> = {
            returnMessages: true,
            memoryKey: memoryKey,
            inputKey: inputKey,
            k: parseInt(k, 10)
        }

        return new BufferWindowMemory(obj)
    }
}

module.exports = { nodeClass: BufferWindowMemory_Memory }
