import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { TextSplitter } from 'langchain/text_splitter'
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio'
import { test } from 'linkifyjs'
import { webCrawl, xmlScrape } from '../../../src'

class Cheerio_DocumentLoaders implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Cheerio Web Scraper'
        this.name = 'cheerioWebScraper'
        this.type = 'Document'
        this.icon = 'cheerio.svg'
        this.category = 'Document Loaders'
        this.description = `从网页加载数据`
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: 'URL',
                name: 'url',
                type: 'string'
            },
            {
                label: '文本分割器',
                name: 'textSplitter',
                type: 'TextSplitter',
                optional: true
            },
            {
                label: 'Get Relative Links Method',
                name: 'relativeLinksMethod',
                type: 'options',
                description: 'Select a method to retrieve relative links',
                options: [
                    {
                        label: 'Web Crawl',
                        name: 'webCrawl',
                        description: 'Crawl relative links from HTML URL'
                    },
                    {
                        label: 'Scrape XML Sitemap',
                        name: 'scrapeXMLSitemap',
                        description: 'Scrape relative links from XML sitemap URL'
                    }
                ],
                optional: true,
                additionalParams: true
            },
            {
                label: 'Get Relative Links Limit',
                name: 'limit',
                type: 'number',
                optional: true,
                additionalParams: true,
                description:
                    'Only used when "Get Relative Links Method" is selected. Set 0 to retrieve all relative links, default limit is 10.',
                warning: `Retreiving all links might take long time, and all links will be upserted again if the flow's state changed (eg: different URL, chunk size, etc)`
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
        const metadata = nodeData.inputs?.metadata
        const relativeLinksMethod = nodeData.inputs?.relativeLinksMethod as string
        let limit = nodeData.inputs?.limit as string

        let url = nodeData.inputs?.url as string
        url = url.trim()
        if (!test(url)) {
            throw new Error('无效的 URL')
        }

        async function cheerioLoader(url: string): Promise<any> {
            try {
                let docs = []
                const loader = new CheerioWebBaseLoader(url)
                if (textSplitter) {
                    docs = await loader.loadAndSplit(textSplitter)
                } else {
                    docs = await loader.load()
                }
                return docs
            } catch (err) {
                if (process.env.DEBUG === 'true') console.error(`error in CheerioWebBaseLoader: ${err.message}, on page: ${url}`)
            }
        }

        let docs = []
        if (relativeLinksMethod) {
            if (process.env.DEBUG === 'true') console.info(`Start ${relativeLinksMethod}`)
            if (!limit) limit = '10'
            else if (parseInt(limit) < 0) throw new Error('Limit cannot be less than 0')
            const pages: string[] =
                relativeLinksMethod === 'webCrawl' ? await webCrawl(url, parseInt(limit)) : await xmlScrape(url, parseInt(limit))
            if (process.env.DEBUG === 'true') console.info(`pages: ${JSON.stringify(pages)}, length: ${pages.length}`)
            if (!pages || pages.length === 0) throw new Error('No relative links found')
            for (const page of pages) {
                docs.push(...(await cheerioLoader(page)))
            }
            if (process.env.DEBUG === 'true') console.info(`Finish ${relativeLinksMethod}`)
        } else {
            docs = await cheerioLoader(url)
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

module.exports = { nodeClass: Cheerio_DocumentLoaders }
