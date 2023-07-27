export const default_qa_template = `使用下面的上下文来回答最后的问题。如果你不知道答案,就直接说你不知道,不要编造答案。 

{context}

问题:{question}  
有用的答案:`

export const qa_template = `使用下面的上下文来回答最后的问题。

{context}

问题:{question}
有用的答案:`

export const default_map_reduce_template = `给定下面这篇长文档的摘要片段和一个问题,构造一个最终的答案。
如果你不知道答案,就直接说你不知道,不要编造答案。

{summaries} 

问题:{question}
有用的答案:`

export const map_reduce_template = `给定下面这篇长文档的摘要片段和一个问题,构造一个最终的答案。

{summaries}

问题:{question} 
有用的答案:`

export const refine_question_template = (sysPrompt?: string) => {
    let returnPrompt = ''
    if (sysPrompt) {
        returnPrompt = `下面是上下文信息。  
    ---------------------
    {context}
    ---------------------
    根据上下文信息而不是之前的知识,${sysPrompt}
    回答问题:{question}。
    答案:`
    }
    if (!sysPrompt) {
        returnPrompt = `下面是上下文信息。
    ---------------------
    {context}
    ---------------------
    根据上下文信息而不是之前的知识,回答问题:{question}。
    答案:`
    }
    return returnPrompt
}

export const refine_template = `原始问题如下:{question}  
我们已经提供了一个现有的答案:{existing_answer}
我们有机会用下面的更多上下文来完善现有的答案(如果需要的话)。
------------
{context}
------------  
根据新的上下文,改进原始答案,更好地回答该问题。
如果你从上下文中找不到答案,返回原始答案。`

export const CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT = `给定下面的对话和一个后续问题,将后续问题重新措辞成一个独立的问题,使用后续问题的语言回答。将后续问题内容包括在独立问题中。

聊天历史: 
{chat_history}
后续问题:{question}
独立问题:`
