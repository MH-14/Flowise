import { INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'
import { Embeddings } from 'langchain/embeddings/base'
import { Document } from 'langchain/document'
import { getBaseClasses } from '../../../src/utils'
import { FaissStore } from 'langchain/vectorstores/faiss'

class FaissUpsert_VectorStores implements INode {
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
        this.label = '插入或更新 Faiss 文档'
        this.name = 'faissUpsert'
        this.type = 'Faiss'
        this.icon = 'faiss.svg'
        this.category = 'Vector Stores'
        this.description = '将文档插入或更新到 Faiss 中'
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
            },
            {
                label: '用于存储的 Base Path',
                name: 'basePath',
                description: '用于存储 faiss.index 文件的路径',
                placeholder: `C:\\Users\\User\\Desktop`,
                type: 'string'
            }
        ]
        this.outputs = [
            {
                label: 'Faiss 检索器',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'Faiss 向量存储',
                name: 'vectorStore',
                baseClasses: [this.type, ...getBaseClasses(FaissStore)]
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const docs = nodeData.inputs?.document as Document[]
        const embeddings = nodeData.inputs?.embeddings as Embeddings
        const output = nodeData.outputs?.output as string
        const basePath = nodeData.inputs?.basePath as string

        const flattenDocs = docs && docs.length ? docs.flat() : []
        const finalDocs = []
        for (let i = 0; i < flattenDocs.length; i += 1) {
            finalDocs.push(new Document(flattenDocs[i]))
        }

        const vectorStore = await FaissStore.fromDocuments(finalDocs, embeddings)
        await vectorStore.save(basePath)

        if (output === 'retriever') {
            const retriever = vectorStore.asRetriever()
            return retriever
        } else if (output === 'vectorStore') {
            return vectorStore
        }
        return vectorStore
    }
}

module.exports = { nodeClass: FaissUpsert_VectorStores }
