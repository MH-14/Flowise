import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { HuggingFaceInference } from 'langchain/llms/hf'

class HuggingFaceInference_LLMs implements INode {
    label: string
    name: string
    type: string
    icon: string
    category: string
    description: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'HuggingFace Inference'
        this.name = 'huggingFaceInference_LLMs'
        this.type = 'HuggingFaceInference'
        this.icon = 'huggingface.png'
        this.category = 'LLMs'
        this.description = '一个 HuggingFace 大规模语言模型的封装'
        this.baseClasses = [this.type, ...getBaseClasses(HuggingFaceInference)]
        this.inputs = [
            {
                label: '模型',
                name: 'model',
                type: 'string',
                placeholder: 'gpt2'
            },
            {
                label: 'HuggingFace Api 密钥',
                name: 'apiKey',
                type: 'password'
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as string
        const apiKey = nodeData.inputs?.apiKey as string

        const huggingFace = new HuggingFaceInference({
            model,
            apiKey
        })
        return huggingFace
    }
}

module.exports = { nodeClass: HuggingFaceInference_LLMs }
