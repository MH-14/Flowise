import { INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'
import { Embeddings } from 'langchain/embeddings/base'
import { getBaseClasses } from '../../../src/utils'
import { SupabaseLibArgs, SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { createClient } from '@supabase/supabase-js'

class Supabase_Existing_VectorStores implements INode {
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
        this.label = '加载存在的 Supabase 索引'
        this.name = 'supabaseExistingIndex'
        this.type = 'Supabase'
        this.icon = 'supabase.svg'
        this.category = 'Vector Stores'
        this.description = '从 Supabase 中加载现有的索引 (即: 文档已被插入或更新)'
        this.baseClasses = [this.type, 'VectorStoreRetriever', 'BaseRetriever']
        this.inputs = [
            {
                label: '嵌入向量',
                name: 'embeddings',
                type: 'Embeddings'
            },
            {
                label: 'Supabase API 密钥',
                name: 'supabaseApiKey',
                type: 'password'
            },
            {
                label: 'Supabase Project 链接',
                name: 'supabaseProjUrl',
                type: 'string'
            },
            {
                label: 'Table 名称',
                name: 'tableName',
                type: 'string'
            },
            {
                label: 'Query 名称',
                name: 'queryName',
                type: 'string'
            },
            {
                label: 'Supabase Metadata Filter',
                name: 'supabaseMetadataFilter',
                type: 'json',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top K',
                name: 'topK',
                description: 'Number of top results to fetch. Default to 4',
                placeholder: '4',
                type: 'number',
                additionalParams: true,
                optional: true
            }
        ]
        this.outputs = [
            {
                label: 'Supabase 检索器',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'Supabase 向量存储',
                name: 'vectorStore',
                baseClasses: [this.type, ...getBaseClasses(SupabaseVectorStore)]
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const supabaseApiKey = nodeData.inputs?.supabaseApiKey as string
        const supabaseProjUrl = nodeData.inputs?.supabaseProjUrl as string
        const tableName = nodeData.inputs?.tableName as string
        const queryName = nodeData.inputs?.queryName as string
        const embeddings = nodeData.inputs?.embeddings as Embeddings
        const supabaseMetadataFilter = nodeData.inputs?.supabaseMetadataFilter
        const output = nodeData.outputs?.output as string
        const topK = nodeData.inputs?.topK as string
        const k = topK ? parseInt(topK, 10) : 4

        const client = createClient(supabaseProjUrl, supabaseApiKey)

        const obj: SupabaseLibArgs = {
            client,
            tableName,
            queryName
        }

        if (supabaseMetadataFilter) {
            const metadatafilter = typeof supabaseMetadataFilter === 'object' ? supabaseMetadataFilter : JSON.parse(supabaseMetadataFilter)
            obj.filter = metadatafilter
        }

        const vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, obj)

        if (output === 'retriever') {
            const retriever = vectorStore.asRetriever(k)
            return retriever
        } else if (output === 'vectorStore') {
            ;(vectorStore as any).k = k
            return vectorStore
        }
        return vectorStore
    }
}

module.exports = { nodeClass: Supabase_Existing_VectorStores }
