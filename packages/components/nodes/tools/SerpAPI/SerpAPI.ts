import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { SerpAPI } from 'langchain/tools'

class SerpAPI_Tools implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Serp API'
        this.name = 'serpAPI'
        this.type = 'SerpAPI'
        this.icon = 'serp.png'
        this.category = 'Tools'
        this.description = '一个可以实时访问Google搜索结果的API工具'
        this.inputs = [
            {
                label: 'Serp Api 密钥',
                name: 'apiKey',
                type: 'password'
            }
        ]
        this.baseClasses = [this.type, ...getBaseClasses(SerpAPI)]
    }

    async init(nodeData: INodeData): Promise<any> {
        const apiKey = nodeData.inputs?.apiKey as string
        return new SerpAPI(apiKey)
    }
}

module.exports = { nodeClass: SerpAPI_Tools }
