import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { TokenTextSplitter, TokenTextSplitterParams } from 'langchain/text_splitter'
import { TiktokenEncoding } from '@dqbd/tiktoken'

class TokenTextSplitter_TextSplitters implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Token 文本分割器'
        this.name = 'tokenTextSplitter'
        this.type = 'TokenTextSplitter'
        this.icon = 'tiktoken.svg'
        this.category = 'Text Splitters'
        this.description = `将原始文本字符串分割成若干个部分, 首先将文本转换为BPE标记, 然后将这些标记分成块, 并将单个块内的标记重新转换为文本`
        this.baseClasses = [this.type, ...getBaseClasses(TokenTextSplitter)]
        this.inputs = [
            {
                label: '编码名称',
                name: 'encodingName',
                type: 'options',
                options: [
                    {
                        label: 'gpt2',
                        name: 'gpt2'
                    },
                    {
                        label: 'r50k_base',
                        name: 'r50k_base'
                    },
                    {
                        label: 'p50k_base',
                        name: 'p50k_base'
                    },
                    {
                        label: 'p50k_edit',
                        name: 'p50k_edit'
                    },
                    {
                        label: 'cl100k_base',
                        name: 'cl100k_base'
                    }
                ],
                default: 'gpt2'
            },
            {
                label: '块大小',
                name: 'chunkSize',
                type: 'number',
                default: 1000,
                optional: true
            },
            {
                label: '块重叠大小',
                name: 'chunkOverlap',
                type: 'number',
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const encodingName = nodeData.inputs?.encodingName as string
        const chunkSize = nodeData.inputs?.chunkSize as string
        const chunkOverlap = nodeData.inputs?.chunkOverlap as string

        const obj = {} as TokenTextSplitterParams

        obj.encodingName = encodingName as TiktokenEncoding
        if (chunkSize) obj.chunkSize = parseInt(chunkSize, 10)
        if (chunkOverlap) obj.chunkOverlap = parseInt(chunkOverlap, 10)

        const splitter = new TokenTextSplitter(obj)

        return splitter
    }
}

module.exports = { nodeClass: TokenTextSplitter_TextSplitters }
