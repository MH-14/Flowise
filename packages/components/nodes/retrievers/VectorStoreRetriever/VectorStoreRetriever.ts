import { VectorStore } from 'langchain/vectorstores/base'
import { INode, INodeData, INodeParams, VectorStoreRetriever, VectorStoreRetrieverInput } from '../../../src/Interface'

class VectorStoreRetriever_Retrievers implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Vector Store Retriever'
        this.name = 'vectorStoreRetriever'
        this.type = 'VectorStoreRetriever'
        this.icon = 'vectorretriever.svg'
        this.category = 'Retrievers'
        this.description = '将向量存储为检索器, 以便稍后由MultiRetrievalQAChain进行查询'
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: '向量存储',
                name: 'vectorStore',
                type: 'VectorStore'
            },
            {
                label: '检索器名称',
                name: 'name',
                type: 'string',
                placeholder: '奈飞电影'
            },
            {
                label: '检索器描述',
                name: 'description',
                type: 'string',
                rows: 3,
                description: '描述什么条件下使用该向量存储检索器',
                placeholder: '擅长回答有关奈飞电影的问题'
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const name = nodeData.inputs?.name as string
        const description = nodeData.inputs?.description as string
        const vectorStore = nodeData.inputs?.vectorStore as VectorStore

        const obj = {
            name,
            description,
            vectorStore
        } as VectorStoreRetrieverInput

        const retriever = new VectorStoreRetriever(obj)
        return retriever
    }
}

module.exports = { nodeClass: VectorStoreRetriever_Retrievers }
