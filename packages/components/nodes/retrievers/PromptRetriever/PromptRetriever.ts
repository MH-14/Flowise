import { INode, INodeData, INodeParams, PromptRetriever, PromptRetrieverInput } from '../../../src/Interface'

class PromptRetriever_Retrievers implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Prompt Retriever'
        this.name = 'promptRetriever'
        this.type = 'PromptRetriever'
        this.icon = 'promptretriever.svg'
        this.category = 'Retrievers'
        this.description = '存储带有名称和描述的 Prompt(提示) 模板, 以便稍后由 MultiPromptChain 查询'
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: 'Prompt(提示) 名称',
                name: 'name',
                type: 'string',
                placeholder: 'physics-qa'
            },
            {
                label: 'Prompt(提示) 描述',
                name: 'description',
                type: 'string',
                rows: 3,
                description: '描述 Prompt(提示) 的作用以及何时应该使用它',
                placeholder: '善于回答物理学方面的问题'
            },
            {
                label: 'Prompt(提示) 系统消息',
                name: 'systemMessage',
                type: 'string',
                rows: 4,
                placeholder: `您是一位非常聪明的物理学教授. 您擅长以简明易懂的方式回答物理问题. 当您不知道问题的答案时, 您会坦率地承认自己不知道.`
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const name = nodeData.inputs?.name as string
        const description = nodeData.inputs?.description as string
        const systemMessage = nodeData.inputs?.systemMessage as string

        const obj = {
            name,
            description,
            systemMessage
        } as PromptRetrieverInput

        const retriever = new PromptRetriever(obj)
        return retriever
    }
}

module.exports = { nodeClass: PromptRetriever_Retrievers }
