import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { TextSplitter } from 'langchain/text_splitter'
import { NotionLoader } from 'langchain/document_loaders/fs/notion'

class NotionFolder_DocumentLoaders implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Notion Folder'
        this.name = 'notionFolder'
        this.type = 'Document'
        this.icon = 'notion.png'
        this.category = 'Document Loaders'
        this.description = '从导出并解压缩的 Notion 文件夹中加载数据。'
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: 'Notion 文件夹',
                name: 'notionFolder',
                type: 'string',
                description: '获取文件夹路径',
                placeholder: '在这里粘贴文件夹路径'
            },
            {
                label: '文本分割器',
                name: 'textSplitter',
                type: 'TextSplitter',
                optional: true
            },
            {
                label: 'Metadata',
                name: 'metadata',
                type: 'json',
                optional: true,
                additionalParams: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const textSplitter = nodeData.inputs?.textSplitter as TextSplitter
        const notionFolder = nodeData.inputs?.notionFolder as string
        const metadata = nodeData.inputs?.metadata

        const loader = new NotionLoader(notionFolder)
        let docs = []

        if (textSplitter) {
            docs = await loader.loadAndSplit(textSplitter)
        } else {
            docs = await loader.load()
        }

        if (metadata) {
            const parsedMetadata = typeof metadata === 'object' ? metadata : JSON.parse(metadata)
            let finaldocs = []
            for (const doc of docs) {
                const newdoc = {
                    ...doc,
                    metadata: {
                        ...doc.metadata,
                        ...parsedMetadata
                    }
                }
                finaldocs.push(newdoc)
            }
            return finaldocs
        }

        return docs
    }
}

module.exports = { nodeClass: NotionFolder_DocumentLoaders }
