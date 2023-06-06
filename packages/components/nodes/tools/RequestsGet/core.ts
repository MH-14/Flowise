import fetch from 'node-fetch'
import { Tool } from 'langchain/tools'

export const desc = `一个互联网门户. 当您需要从网站获取特定内容时, 请使用此功能. 输入应该是一个URL (例如 https://www.google.com). 输出将是GET请求的文本响应`

export interface Headers {
    [key: string]: string
}

export interface RequestParameters {
    headers?: Headers
    url?: string
    description?: string
    maxOutputLength?: number
}

export class RequestsGetTool extends Tool {
    name = 'requests_get'
    url = ''
    description = desc
    maxOutputLength = 2000
    headers = {}

    constructor(args?: RequestParameters) {
        super()
        this.url = args?.url ?? this.url
        this.headers = args?.headers ?? this.headers
        this.description = args?.description ?? this.description
        this.maxOutputLength = args?.maxOutputLength ?? this.maxOutputLength
    }

    /** @ignore */
    async _call(input: string) {
        const inputUrl = !this.url ? input : this.url

        if (process.env.DEBUG === 'true') console.info(`Making GET API call to ${inputUrl}`)

        const res = await fetch(inputUrl, {
            headers: this.headers
        })

        const text = await res.text()
        return text.slice(0, this.maxOutputLength)
    }
}
