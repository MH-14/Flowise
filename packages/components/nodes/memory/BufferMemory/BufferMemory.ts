import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { BufferMemory } from 'langchain/memory'

class BufferMemory_Memory implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Buffer Memory'
        this.name = 'bufferMemory'
        this.type = 'BufferMemory'
        this.icon = 'memory.svg'
        this.category = 'Memory'
        this.description = '直接记忆之前的对话互动'
        this.baseClasses = [this.type, ...getBaseClasses(BufferMemory)]
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
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const memoryKey = nodeData.inputs?.memoryKey as string
        const inputKey = nodeData.inputs?.inputKey as string
        return new BufferMemory({
            returnMessages: true,
            memoryKey,
            inputKey
        })
    }
}

module.exports = { nodeClass: BufferMemory_Memory }
