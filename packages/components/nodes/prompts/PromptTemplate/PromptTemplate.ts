import { ICommonObject, INode, INodeData, INodeParams, PromptTemplate } from '../../../src/Interface'
import { getBaseClasses, getInputVariables } from '../../../src/utils'
import { PromptTemplateInput } from 'langchain/prompts'

class PromptTemplate_Prompts implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = '提示模板'
        this.name = 'promptTemplate'
        this.type = 'PromptTemplate'
        this.icon = 'prompt.svg'
        this.category = 'Prompts'
        this.description = '用于规范 LLM 基本提示的模式'
        this.baseClasses = [...getBaseClasses(PromptTemplate)]
        this.inputs = [
            {
                label: 'Template',
                name: 'template',
                type: 'string',
                rows: 4,
                placeholder: `你能给生产 {product} 的公司起一个好名字吗?`
            },
            {
                label: '用于格式化 Prompt(提示) 的值',
                name: 'promptValues',
                type: 'string',
                rows: 4,
                placeholder: `{
                    "product": "香蕉",
                }`,
                optional: true,
                acceptVariable: true,
                list: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const template = nodeData.inputs?.template as string
        const promptValuesStr = nodeData.inputs?.promptValues as string

        let promptValues: ICommonObject = {}
        if (promptValuesStr) {
            promptValues = JSON.parse(promptValuesStr.replace(/\s/g, ''))
        }

        const inputVariables = getInputVariables(template)

        try {
            const options: PromptTemplateInput = {
                template,
                inputVariables
            }
            const prompt = new PromptTemplate(options)
            prompt.promptValues = promptValues
            return prompt
        } catch (e) {
            throw new Error(e)
        }
    }
}

module.exports = { nodeClass: PromptTemplate_Prompts }
