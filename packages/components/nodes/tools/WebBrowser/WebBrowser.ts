import { BaseLanguageModel } from 'langchain/base_language'
import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { WebBrowser } from 'langchain/tools/webbrowser'
import { Embeddings } from 'langchain/embeddings/base'

class WebBrowser_Tools implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = '网络浏览器'
        this.name = 'webBrowser'
        this.type = 'WebBrowser'
        this.icon = 'webBrowser.svg'
        this.category = 'Tools'
        this.description = '让机器人有能力访问网站并提取信息'
        this.inputs = [
            {
                label: '语言模型',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: '嵌入向量',
                name: 'embeddings',
                type: 'Embeddings'
            }
        ]
        this.baseClasses = [this.type, ...getBaseClasses(WebBrowser)]
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        const embeddings = nodeData.inputs?.embeddings as Embeddings

        return new WebBrowser({ model, embeddings })
    }
}

module.exports = { nodeClass: WebBrowser_Tools }
