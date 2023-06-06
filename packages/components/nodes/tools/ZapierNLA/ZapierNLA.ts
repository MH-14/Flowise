import { ZapierNLAWrapper, ZapiterNLAWrapperParams } from 'langchain/tools'
import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { ZapierToolKit } from 'langchain/agents'

class ZapierNLA_Tools implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Zapier NLA'
        this.name = 'zapierNLA'
        this.type = 'ZapierNLA'
        this.icon = 'zapier.png'
        this.category = 'Tools'
        this.description = '通过自然语言API接口, 可以访问Zapier平台上的应用程序和操作'
        this.inputs = [
            {
                label: 'Zapier NLA Api 密钥',
                name: 'apiKey',
                type: 'password'
            }
        ]
        this.baseClasses = [this.type, 'Tool']
    }

    async init(nodeData: INodeData): Promise<any> {
        const apiKey = nodeData.inputs?.apiKey as string

        const obj: Partial<ZapiterNLAWrapperParams> = {
            apiKey
        }
        const zapier = new ZapierNLAWrapper(obj)
        const toolkit = await ZapierToolKit.fromZapierNLAWrapper(zapier)

        return toolkit.tools
    }
}

module.exports = { nodeClass: ZapierNLA_Tools }
