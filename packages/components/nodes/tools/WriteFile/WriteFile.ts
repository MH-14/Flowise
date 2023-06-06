import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { WriteFileTool } from 'langchain/tools'
import { NodeFileStore } from 'langchain/stores/file/node'

class WriteFile_Tools implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = '文件写入'
        this.name = 'writeFile'
        this.type = 'WriteFile'
        this.icon = 'writefile.svg'
        this.category = 'Tools'
        this.description = '向磁盘中写入文件'
        this.baseClasses = [this.type, 'Tool', ...getBaseClasses(WriteFileTool)]
        this.inputs = [
            {
                label: 'Base Path',
                name: 'basePath',
                placeholder: `C:\\Users\\User\\Desktop`,
                type: 'string',
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const basePath = nodeData.inputs?.basePath as string
        const store = basePath ? new NodeFileStore(basePath) : new NodeFileStore()
        return new WriteFileTool({ store })
    }
}

module.exports = { nodeClass: WriteFile_Tools }
