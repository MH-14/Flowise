import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses, getInputVariables } from '../../../src/utils'
import { FewShotPromptTemplate, FewShotPromptTemplateInput, PromptTemplate } from 'langchain/prompts'
import { Example } from 'langchain/schema'
import { TemplateFormat } from 'langchain/dist/prompts/template'

class FewShotPromptTemplate_Prompts implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = '少样本提示模板'
        this.name = 'fewShotPromptTemplate'
        this.type = 'FewShotPromptTemplate'
        this.icon = 'prompt.svg'
        this.category = 'Prompts'
        this.description = '你可以根据示例构建提示模板'
        this.baseClasses = [this.type, ...getBaseClasses(FewShotPromptTemplate)]
        this.inputs = [
            {
                label: 'Examples',
                name: 'examples',
                type: 'string',
                rows: 4,
                placeholder: `[
                    { "word": "开心", "antonym": "难过" },
                    { "word": "高", "antonym": "矮" },
                ]`
            },
            {
                label: '提示词示例',
                name: 'examplePrompt',
                type: 'PromptTemplate'
            },
            {
                label: '前置提示',
                name: 'prefix',
                type: 'string',
                rows: 4,
                placeholder: `为每一个输入给出反义词`
            },
            {
                label: '后置提示',
                name: 'suffix',
                type: 'string',
                rows: 4,
                placeholder: `词语: {input}\n反义词:`
            },
            {
                label: '分隔符示例',
                name: 'exampleSeparator',
                type: 'string',
                placeholder: `\n\n`
            },
            {
                label: '格式化模板',
                name: 'templateFormat',
                type: 'options',
                options: [
                    {
                        label: 'f-string',
                        name: 'f-string'
                    },
                    {
                        label: 'jinja-2',
                        name: 'jinja-2'
                    }
                ],
                default: `f-string`
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const examplesStr = nodeData.inputs?.examples as string
        const prefix = nodeData.inputs?.prefix as string
        const suffix = nodeData.inputs?.suffix as string
        const exampleSeparator = nodeData.inputs?.exampleSeparator as string
        const templateFormat = nodeData.inputs?.templateFormat as TemplateFormat
        const examplePrompt = nodeData.inputs?.examplePrompt as PromptTemplate

        const inputVariables = getInputVariables(suffix)
        const examples: Example[] = JSON.parse(examplesStr)

        try {
            const obj: FewShotPromptTemplateInput = {
                examples,
                examplePrompt,
                prefix,
                suffix,
                inputVariables,
                exampleSeparator,
                templateFormat
            }
            const prompt = new FewShotPromptTemplate(obj)
            return prompt
        } catch (e) {
            throw new Error(e)
        }
    }
}

module.exports = { nodeClass: FewShotPromptTemplate_Prompts }
