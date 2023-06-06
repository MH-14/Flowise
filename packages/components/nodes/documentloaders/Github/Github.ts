import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { TextSplitter } from 'langchain/text_splitter'
import { GithubRepoLoader, GithubRepoLoaderParams } from 'langchain/document_loaders/web/github'

class Github_DocumentLoaders implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Github'
        this.name = 'github'
        this.type = 'Document'
        this.icon = 'github.png'
        this.category = 'Document Loaders'
        this.description = `从 GitHub 仓库加载数据`
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: '仓库链接',
                name: 'repoLink',
                type: 'string',
                placeholder: 'https://github.com/FlowiseAI/Flowise'
            },
            {
                label: '分支',
                name: 'branch',
                type: 'string',
                default: 'main'
            },
            {
                label: '访问令牌',
                name: 'accessToken',
                type: 'password',
                placeholder: '<GITHUB_ACCESS_TOKEN>',
                optional: true
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
        const repoLink = nodeData.inputs?.repoLink as string
        const branch = nodeData.inputs?.branch as string
        const accessToken = nodeData.inputs?.accessToken as string
        const textSplitter = nodeData.inputs?.textSplitter as TextSplitter
        const metadata = nodeData.inputs?.metadata

        const options: GithubRepoLoaderParams = {
            branch,
            recursive: false,
            unknown: 'warn'
        }

        if (accessToken) options.accessToken = accessToken

        const loader = new GithubRepoLoader(repoLink, options)
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

module.exports = { nodeClass: Github_DocumentLoaders }
