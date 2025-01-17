import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { OpenApiToolkit } from 'langchain/agents'
import { JsonSpec, JsonObject } from 'langchain/tools'
import { BaseLanguageModel } from 'langchain/base_language'
import { load } from 'js-yaml'

class OpenAPIToolkit_Tools implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'OpenAPI Toolkit'
        this.name = 'openAPIToolkit'
        this.type = 'OpenAPIToolkit'
        this.icon = 'openapi.png'
        this.category = 'Tools'
        this.description = '加载 OpenAPI 规范'
        this.inputs = [
            {
                label: 'OpenAI API 密钥',
                name: 'openAIApiKey',
                type: 'password'
            },
            {
                label: '语言模型',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: 'YAML 文件',
                name: 'yamlFile',
                type: 'file',
                fileType: '.yaml'
            }
        ]
        this.baseClasses = [this.type, 'Tool']
    }

    async init(nodeData: INodeData): Promise<any> {
        const openAIApiKey = nodeData.inputs?.openAIApiKey as string
        const model = nodeData.inputs?.model as BaseLanguageModel
        const yamlFileBase64 = nodeData.inputs?.yamlFile as string

        const splitDataURI = yamlFileBase64.split(',')
        splitDataURI.pop()
        const bf = Buffer.from(splitDataURI.pop() || '', 'base64')
        const utf8String = bf.toString('utf-8')
        const data = load(utf8String) as JsonObject
        if (!data) {
            throw new Error('加载 OpenAPI 规范失败')
        }

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAIApiKey}`
        }
        const toolkit = new OpenApiToolkit(new JsonSpec(data), model, headers)

        return toolkit.tools
    }
}

module.exports = { nodeClass: OpenAPIToolkit_Tools }
