import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { ChainTool } from 'langchain/tools'
import { BaseChain } from 'langchain/chains'

class ChainTool_Tools implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = '链工具'
        this.name = 'chainTool'
        this.type = 'ChainTool'
        this.icon = 'chaintool.svg'
        this.category = 'Tools'
        this.description = '将 Chain 作为允许的 tool 供代理使用'
        this.baseClasses = [this.type, ...getBaseClasses(ChainTool)]
        this.inputs = [
            {
                label: '链名称',
                name: 'name',
                type: 'string',
                placeholder: 'state-of-union-qa'
            },
            {
                label: '链描述',
                name: 'description',
                type: 'string',
                rows: 3,
                placeholder: '国情咨文问答 - 当您需要询问有关最近国情咨文的问题时非常有用。'
            },
            {
                label: '直接返回',
                name: 'returnDirect',
                type: 'boolean',
                optional: true
            },
            {
                label: '基础链',
                name: 'baseChain',
                type: 'BaseChain'
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const name = nodeData.inputs?.name as string
        const description = nodeData.inputs?.description as string
        const baseChain = nodeData.inputs?.baseChain as BaseChain
        const returnDirect = nodeData.inputs?.returnDirect as boolean

        const obj = {
            name,
            description,
            chain: baseChain
        } as any

        if (returnDirect) obj.returnDirect = returnDirect

        const tool = new ChainTool(obj)

        return tool
    }
}

module.exports = { nodeClass: ChainTool_Tools }
