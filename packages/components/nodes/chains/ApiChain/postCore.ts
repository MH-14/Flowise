import { BaseLanguageModel } from 'langchain/base_language'
import { CallbackManagerForChainRun } from 'langchain/callbacks'
import { BaseChain, ChainInputs, LLMChain, SerializedAPIChain } from 'langchain/chains'
import { BasePromptTemplate, PromptTemplate } from 'langchain/prompts'
import { ChainValues } from 'langchain/schema'
import fetch from 'node-fetch'

export const API_URL_RAW_PROMPT_TEMPLATE = `你得到了以下 API 文档：
{api_docs}
使用这份文档，生成一个包含 "url" 和 "data" 两个键的 JSON 字符串.
"url" 的值应该是一个字符串，表示要调用的 API 的 URL.
"data" 的值应该是一个字典，包含你想要作为 JSON 主体 发送 POST 请求到 url 的键值对.
在 JSON 字符串中，一定要始终使用双引号来表示字符串.
你应该构建这个 JSON 字符串，以便获得尽可能简短的响应，同时仍然获得回答问题所需的必要信息. 注意有意排除 API 调用中任何不必要的数据.

问题：{question}
JSON 字符串：`

export const API_RESPONSE_RAW_PROMPT_TEMPLATE = `${API_URL_RAW_PROMPT_TEMPLATE} {api_url_body}

这是 API 的响应结果:

{api_response}

总结一下这个响应结果来回答原始问题.

总结:`

const defaultApiUrlPrompt = new PromptTemplate({
    inputVariables: ['api_docs', 'question'],
    template: API_URL_RAW_PROMPT_TEMPLATE
})

const defaultApiResponsePrompt = new PromptTemplate({
    inputVariables: ['api_docs', 'question', 'api_url_body', 'api_response'],
    template: API_RESPONSE_RAW_PROMPT_TEMPLATE
})

export interface APIChainInput extends Omit<ChainInputs, 'memory'> {
    apiAnswerChain: LLMChain
    apiRequestChain: LLMChain
    apiDocs: string
    inputKey?: string
    headers?: Record<string, string>
    /** Key to use for output, defaults to `output` */
    outputKey?: string
}

export type APIChainOptions = {
    headers?: Record<string, string>
    apiUrlPrompt?: BasePromptTemplate
    apiResponsePrompt?: BasePromptTemplate
}

export class APIChain extends BaseChain implements APIChainInput {
    apiAnswerChain: LLMChain

    apiRequestChain: LLMChain

    apiDocs: string

    headers = {}

    inputKey = 'question'

    outputKey = 'output'

    get inputKeys() {
        return [this.inputKey]
    }

    get outputKeys() {
        return [this.outputKey]
    }

    constructor(fields: APIChainInput) {
        super(fields)
        this.apiRequestChain = fields.apiRequestChain
        this.apiAnswerChain = fields.apiAnswerChain
        this.apiDocs = fields.apiDocs
        this.inputKey = fields.inputKey ?? this.inputKey
        this.outputKey = fields.outputKey ?? this.outputKey
        this.headers = fields.headers ?? this.headers
    }

    /** @ignore */
    async _call(values: ChainValues, runManager?: CallbackManagerForChainRun): Promise<ChainValues> {
        try {
            const question: string = values[this.inputKey]

            const api_url_body = await this.apiRequestChain.predict({ question, api_docs: this.apiDocs }, runManager?.getChild())

            const { url, data } = JSON.parse(api_url_body)

            const res = await fetch(url, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            })

            const api_response = await res.text()

            const answer = await this.apiAnswerChain.predict(
                { question, api_docs: this.apiDocs, api_url_body, api_response },
                runManager?.getChild()
            )

            return { [this.outputKey]: answer }
        } catch (error) {
            return { [this.outputKey]: error }
        }
    }

    _chainType() {
        return 'api_chain' as const
    }

    static async deserialize(data: SerializedAPIChain) {
        const { api_request_chain, api_answer_chain, api_docs } = data

        if (!api_request_chain) {
            throw new Error('需要为 LLMChain 提供 api_request_chain')
        }
        if (!api_answer_chain) {
            throw new Error('需要为 LLMChain 提供 api_answer_chain')
        }
        if (!api_docs) {
            throw new Error('需要为 LLMChain 提供 api_docs')
        }

        return new APIChain({
            apiAnswerChain: await LLMChain.deserialize(api_answer_chain),
            apiRequestChain: await LLMChain.deserialize(api_request_chain),
            apiDocs: api_docs
        })
    }

    serialize(): SerializedAPIChain {
        return {
            _type: this._chainType(),
            api_answer_chain: this.apiAnswerChain.serialize(),
            api_request_chain: this.apiRequestChain.serialize(),
            api_docs: this.apiDocs
        }
    }

    static fromLLMAndAPIDocs(
        llm: BaseLanguageModel,
        apiDocs: string,
        options: APIChainOptions & Omit<APIChainInput, 'apiAnswerChain' | 'apiRequestChain' | 'apiDocs'> = {}
    ): APIChain {
        const { apiUrlPrompt = defaultApiUrlPrompt, apiResponsePrompt = defaultApiResponsePrompt } = options
        const apiRequestChain = new LLMChain({ prompt: apiUrlPrompt, llm })
        const apiAnswerChain = new LLMChain({ prompt: apiResponsePrompt, llm })
        return new this({
            apiAnswerChain,
            apiRequestChain,
            apiDocs,
            ...options
        })
    }
}
