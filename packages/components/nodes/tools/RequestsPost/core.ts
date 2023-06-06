import { Tool } from 'langchain/tools'
import fetch from 'node-fetch'

export const desc = `当您想要向网站发送POST请求时, 请使用此功能.
输入应该是一个JSON字符串, 其中包含两个键："url"和"data".
"url"的值应该是一个字符串, "data"的值应该是一个字典, 其中包含您想要作为JSON主体发送POST请求到URL的键值对.
请注意, 在JSON字符串中始终使用双引号来表示字符串. 输出将是POST请求的文本响应.`

export interface Headers {
    [key: string]: string
}

export interface Body {
    [key: string]: any
}

export interface RequestParameters {
    headers?: Headers
    body?: Body
    url?: string
    description?: string
    maxOutputLength?: number
}

export class RequestsPostTool extends Tool {
    name = 'requests_post'
    url = ''
    description = desc
    maxOutputLength = Infinity
    headers = {}
    body = {}

    constructor(args?: RequestParameters) {
        super()
        this.url = args?.url ?? this.url
        this.headers = args?.headers ?? this.headers
        this.body = args?.body ?? this.body
        this.description = args?.description ?? this.description
        this.maxOutputLength = args?.maxOutputLength ?? this.maxOutputLength
    }

    /** @ignore */
    async _call(input: string) {
        try {
            let inputUrl = ''
            let inputBody = {}
            if (Object.keys(this.body).length || this.url) {
                if (this.url) inputUrl = this.url
                if (Object.keys(this.body).length) inputBody = this.body
            } else {
                const { url, data } = JSON.parse(input)
                inputUrl = url
                inputBody = data
            }

            if (process.env.DEBUG === 'true') console.info(`Making POST API call to ${inputUrl} with body ${JSON.stringify(inputBody)}`)

            const res = await fetch(inputUrl, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(inputBody)
            })

            const text = await res.text()
            return text.slice(0, this.maxOutputLength)
        } catch (error) {
            return `${error}`
        }
    }
}
