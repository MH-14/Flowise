import { ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { APIChain } from 'langchain/chains'
import { CustomChainHandler, getBaseClasses } from '../../../src/utils'
import { BaseLanguageModel } from 'langchain/base_language'
import { PromptTemplate } from 'langchain/prompts'

export const API_URL_RAW_PROMPT_TEMPLATE = `给你以下API文档: 
{api_docs}
使用这份文档, 生成完整的API地址以回答用户的问题。
你应该构建API url, 以便获得尽可能简短的响应, 同时仍然获取回答问题所需的必要信息。请注意在API调用中刻意排除任何不必要的数据片段。

问题: {question}
API url: `

export const API_RESPONSE_RAW_PROMPT_TEMPLATE = '根据 {api_url} 的请求，得到了 {api_response} 的响应。请使用此响应来回答 {question}。'

class GETApiChain_Chains implements INode {
    label: string
    name: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    description: string
    inputs: INodeParams[]

    constructor() {
        this.label = 'GET API Chain'
        this.name = 'getApiChain'
        this.type = 'GETApiChain'
        this.icon = 'apichain.svg'
        this.category = 'Chains'
        this.description = '在 GET API 上运行查询的链式操作'
        this.baseClasses = [this.type, ...getBaseClasses(APIChain)]
        this.inputs = [
            {
                label: '语言模型',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: 'API 文档',
                name: 'apiDocs',
                type: 'string',
                description:
                    'API 工作原理的描述。请参考 <a target="_blank" href="https://github.com/hwchase17/langchain/blob/master/langchain/chains/api/open_meteo_docs.py">示例</a>',
                rows: 4
            },
            {
                label: '头部',
                name: 'headers',
                type: 'json',
                additionalParams: true,
                optional: true
            },
            {
                label: 'URL Prompt(提示)',
                name: 'urlPrompt',
                type: 'string',
                description: '用于告诉语言模型如何构建URL的Prompt(提示)。必须包含{api_docs}和{question}',
                default: API_URL_RAW_PROMPT_TEMPLATE,
                rows: 4,
                additionalParams: true
            },
            {
                label: '答案 Prompt(提示)',
                name: 'ansPrompt',
                type: 'string',
                description: '用于告诉语言模型如何返回API响应的Prompt(提示)。必须包含{api_response}、{api_url}和{question}',
                default: API_RESPONSE_RAW_PROMPT_TEMPLATE,
                rows: 4,
                additionalParams: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        const apiDocs = nodeData.inputs?.apiDocs as string
        const headers = nodeData.inputs?.headers as string
        const urlPrompt = nodeData.inputs?.urlPrompt as string
        const ansPrompt = nodeData.inputs?.ansPrompt as string

        const chain = await getAPIChain(apiDocs, model, headers, urlPrompt, ansPrompt)
        return chain
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        const apiDocs = nodeData.inputs?.apiDocs as string
        const headers = nodeData.inputs?.headers as string
        const urlPrompt = nodeData.inputs?.urlPrompt as string
        const ansPrompt = nodeData.inputs?.ansPrompt as string

        const chain = await getAPIChain(apiDocs, model, headers, urlPrompt, ansPrompt)
        if (options.socketIO && options.socketIOClientId) {
            const handler = new CustomChainHandler(options.socketIO, options.socketIOClientId, 2)
            const res = await chain.run(input, [handler])
            return res
        } else {
            const res = await chain.run(input)
            return res
        }
    }
}

const getAPIChain = async (documents: string, llm: BaseLanguageModel, headers: string, urlPrompt: string, ansPrompt: string) => {
    const apiUrlPrompt = new PromptTemplate({
        inputVariables: ['api_docs', 'question'],
        template: urlPrompt ? urlPrompt : API_URL_RAW_PROMPT_TEMPLATE
    })

    const apiResponsePrompt = new PromptTemplate({
        inputVariables: ['api_docs', 'question', 'api_url', 'api_response'],
        template: ansPrompt ? ansPrompt : API_RESPONSE_RAW_PROMPT_TEMPLATE
    })

    const chain = APIChain.fromLLMAndAPIDocs(llm, documents, {
        apiUrlPrompt,
        apiResponsePrompt,
        verbose: process.env.DEBUG === 'true' ? true : false,
        headers: typeof headers === 'object' ? headers : headers ? JSON.parse(headers) : {}
    })
    return chain
}

module.exports = { nodeClass: GETApiChain_Chains }
