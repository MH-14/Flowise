import { ICommonObject, INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'
import { getBaseClasses, handleEscapeCharacters } from '../../../src/utils'
import { LLMChain } from 'langchain/chains'
import { BaseLanguageModel } from 'langchain/base_language'
import { ConsoleCallbackHandler, CustomChainHandler } from '../../../src/handler'

class LLMChain_Chains implements INode {
    label: string
    name: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    description: string
    inputs: INodeParams[]
    outputs: INodeOutputsValue[]

    constructor() {
        this.label = 'LLM Chain'
        this.name = 'llmChain'
        this.type = 'LLMChain'
        this.icon = 'chain.svg'
        this.category = 'Chains'
        this.description = '对LLMs运行查询的链'
        this.baseClasses = [this.type, ...getBaseClasses(LLMChain)]
        this.inputs = [
            {
                label: '语言模型',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: 'Prompt(提示)',
                name: 'prompt',
                type: 'BasePromptTemplate'
            },
            {
                label: 'Chain 名称',
                name: 'chainName',
                type: 'string',
                placeholder: '为你的Chain起一个名字',
                optional: true
            }
        ]
        this.outputs = [
            {
                label: 'LLM 链',
                name: 'llmChain',
                baseClasses: [this.type, ...getBaseClasses(LLMChain)]
            },
            {
                label: '输出预测',
                name: 'outputPrediction',
                baseClasses: ['string', 'json']
            }
        ]
    }

    async init(nodeData: INodeData, input: string, options: ICommonObject): Promise<any> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        const prompt = nodeData.inputs?.prompt
        const output = nodeData.outputs?.output as string
        const promptValues = prompt.promptValues as ICommonObject

        if (output === this.name) {
            const chain = new LLMChain({ llm: model, prompt, verbose: process.env.DEBUG === 'true' ? true : false })
            return chain
        } else if (output === 'outputPrediction') {
            const chain = new LLMChain({ llm: model, prompt, verbose: process.env.DEBUG === 'true' ? true : false })
            const inputVariables = chain.prompt.inputVariables as string[] // ["product"]
            const res = await runPrediction(inputVariables, chain, input, promptValues, options)
            // eslint-disable-next-line no-console
            console.log('\x1b[92m\x1b[1m\n*****OUTPUT PREDICTION*****\n\x1b[0m\x1b[0m')
            // eslint-disable-next-line no-console
            console.log(res)
            /**
             * Apply string transformation to convert special chars:
             * FROM: hello i am ben\n\n\thow are you?
             * TO: hello i am benFLOWISE_NEWLINEFLOWISE_NEWLINEFLOWISE_TABhow are you?
             */
            return handleEscapeCharacters(res, false)
        }
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string> {
        const inputVariables = nodeData.instance.prompt.inputVariables as string[] // ["product"]
        const chain = nodeData.instance as LLMChain
        const promptValues = nodeData.inputs?.prompt.promptValues as ICommonObject
        const res = await runPrediction(inputVariables, chain, input, promptValues, options)
        // eslint-disable-next-line no-console
        console.log('\x1b[93m\x1b[1m\n*****FINAL RESULT*****\n\x1b[0m\x1b[0m')
        // eslint-disable-next-line no-console
        console.log(res)
        return res
    }
}

const runPrediction = async (
    inputVariables: string[],
    chain: LLMChain,
    input: string,
    promptValuesRaw: ICommonObject,
    options: ICommonObject
) => {
    const loggerHandler = new ConsoleCallbackHandler(options.logger)
    const isStreaming = options.socketIO && options.socketIOClientId
    const socketIO = isStreaming ? options.socketIO : undefined
    const socketIOClientId = isStreaming ? options.socketIOClientId : ''

    /**
     * Apply string transformation to reverse converted special chars:
     * FROM: { "value": "hello i am benFLOWISE_NEWLINEFLOWISE_NEWLINEFLOWISE_TABhow are you?" }
     * TO: { "value": "hello i am ben\n\n\thow are you?" }
     */
    const promptValues = handleEscapeCharacters(promptValuesRaw, true)

    if (inputVariables.length === 1) {
        if (isStreaming) {
            const handler = new CustomChainHandler(socketIO, socketIOClientId)
            const res = await chain.run(input, [loggerHandler, handler])
            return res
        } else {
            const res = await chain.run(input, [loggerHandler])
            return res
        }
    } else if (inputVariables.length > 1) {
        let seen: string[] = []

        for (const variable of inputVariables) {
            seen.push(variable)
            if (promptValues[variable]) {
                seen.pop()
            }
        }

        if (seen.length === 0) {
            // All inputVariables have fixed values specified
            const options = { ...promptValues }
            if (isStreaming) {
                const handler = new CustomChainHandler(socketIO, socketIOClientId)
                const res = await chain.call(options, [loggerHandler, handler])
                return res?.text
            } else {
                const res = await chain.call(options, [loggerHandler])
                return res?.text
            }
        } else if (seen.length === 1) {
            // If one inputVariable is not specify, use input (user's question) as value
            const lastValue = seen.pop()
            if (!lastValue) throw new Error('请提供 Prompt Values')
            const options = {
                ...promptValues,
                [lastValue]: input
            }
            if (isStreaming) {
                const handler = new CustomChainHandler(socketIO, socketIOClientId)
                const res = await chain.call(options, [loggerHandler, handler])
                return res?.text
            } else {
                const res = await chain.call(options, [loggerHandler])
                return res?.text
            }
        } else {
            throw new Error(`请为 ${seen.join(', ')} 提供 Prompt Values`)
        }
    } else {
        if (isStreaming) {
            const handler = new CustomChainHandler(socketIO, socketIOClientId)
            const res = await chain.run(input, [loggerHandler, handler])
            return res
        } else {
            const res = await chain.run(input, [loggerHandler])
            return res
        }
    }
}

module.exports = { nodeClass: LLMChain_Chains }
