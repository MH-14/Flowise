import { INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { Embeddings } from 'langchain/embeddings/base'
import { Document } from 'langchain/document'
import { getBaseClasses } from '../../../src/utils'

class InMemoryVectorStore_VectorStores implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]
    outputs: INodeOutputsValue[]

    constructor() {
        this.label = '内存向量存储'
        this.name = 'memoryVectorStore'
        this.type = 'Memory'
        this.icon = 'memory.svg'
        this.category = 'Vector Stores'
        this.description = '内存中的向量存储库，存储嵌入并进行精确的线性搜索，以查找最相似的嵌入'
        this.baseClasses = [this.type, 'VectorStoreRetriever', 'BaseRetriever']
        this.inputs = [
            {
                label: '文档',
                name: 'document',
                type: 'Document',
                list: true
            },
            {
                label: '嵌入向量',
                name: 'embeddings',
                type: 'Embeddings'
            }
        ]
        this.outputs = [
            {
                label: '内存检索器',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: '内存向量存储',
                name: 'vectorStore',
                baseClasses: [this.type, ...getBaseClasses(MemoryVectorStore)]
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const docs = nodeData.inputs?.document as Document[]
        const embeddings = nodeData.inputs?.embeddings as Embeddings
        const output = nodeData.outputs?.output as string

        const flattenDocs = docs && docs.length ? docs.flat() : []
        const finalDocs = []
        for (let i = 0; i < flattenDocs.length; i += 1) {
            finalDocs.push(new Document(flattenDocs[i]))
        }

        const vectorStore = await MemoryVectorStore.fromDocuments(finalDocs, embeddings)

        if (output === 'retriever') {
            const retriever = vectorStore.asRetriever()
            return retriever
        } else if (output === 'vectorStore') {
            return vectorStore
        }
        return vectorStore
    }
}

module.exports = { nodeClass: InMemoryVectorStore_VectorStores }
