import { LLMChain } from 'langchain/chains'
import { BaseChatModel } from 'langchain/chat_models/base'
import { VectorStore } from 'langchain/dist/vectorstores/base'
import { Document } from 'langchain/document'
import { PromptTemplate } from 'langchain/prompts'

class TaskCreationChain extends LLMChain {
    constructor(prompt: PromptTemplate, llm: BaseChatModel) {
        super({ prompt, llm })
    }

    static from_llm(llm: BaseChatModel): LLMChain {
        const taskCreationTemplate: string =
            '您是一个任务创建AI, 使用执行代理的结果创建新任务, 目标如下: {objective}.' +
            ' 上一个已完成的任务的结果为：{result}.' +
            ' 该结果基于以下任务描述：{task_description}.' +
            ' 以下是未完成任务列表：{incomplete_tasks}' +
            ' 基于该结果, 创建新任务, 由AI系统完成, 不与未完成任务重叠.' +
            ' 将任务作为数组返回.'

        const prompt = new PromptTemplate({
            template: taskCreationTemplate,
            inputVariables: ['result', 'task_description', 'incomplete_tasks', 'objective']
        })

        return new TaskCreationChain(prompt, llm)
    }
}

class TaskPrioritizationChain extends LLMChain {
    constructor(prompt: PromptTemplate, llm: BaseChatModel) {
        super({ prompt, llm })
    }

    static from_llm(llm: BaseChatModel): TaskPrioritizationChain {
        const taskPrioritizationTemplate: string =
            '你是一款任务优先级AI, 任务是清理并重新排列以下任务列表: {task_names}.' +
            ' 请考虑您的团队的最终目标：{objective}.' +
            ' 请勿删除任何任务.请以编号列表的形式返回结果，例如：' +
            ' #. 第一项任务' +
            ' #. 第二项任务' +
            ' 请使用数字 {next_task_id} 开始任务列表.'
        const prompt = new PromptTemplate({
            template: taskPrioritizationTemplate,
            inputVariables: ['task_names', 'next_task_id', 'objective']
        })
        return new TaskPrioritizationChain(prompt, llm)
    }
}

class ExecutionChain extends LLMChain {
    constructor(prompt: PromptTemplate, llm: BaseChatModel) {
        super({ prompt, llm })
    }

    static from_llm(llm: BaseChatModel): LLMChain {
        const executionTemplate: string =
            '你是一款AI, 根据以下目标执行一项任务: {objective}.' +
            ' 在执行任务前，你需要考虑之前已完成的任务：{context}.' +
            ' 你的任务是：{task}.' +
            ' 回复: '

        const prompt = new PromptTemplate({
            template: executionTemplate,
            inputVariables: ['objective', 'context', 'task']
        })

        return new ExecutionChain(prompt, llm)
    }
}

async function getNextTask(
    taskCreationChain: LLMChain,
    result: string,
    taskDescription: string,
    taskList: string[],
    objective: string
): Promise<any[]> {
    const incompleteTasks: string = taskList.join(', ')
    const response: string = await taskCreationChain.predict({
        result,
        task_description: taskDescription,
        incomplete_tasks: incompleteTasks,
        objective
    })

    const newTasks: string[] = response.split('\n')

    return newTasks.filter((taskName) => taskName.trim()).map((taskName) => ({ task_name: taskName }))
}

interface Task {
    task_id: number
    task_name: string
}

async function prioritizeTasks(
    taskPrioritizationChain: LLMChain,
    thisTaskId: number,
    taskList: Task[],
    objective: string
): Promise<Task[]> {
    const next_task_id = thisTaskId + 1
    const task_names = taskList.map((t) => t.task_name).join(', ')
    const response = await taskPrioritizationChain.predict({ task_names, next_task_id, objective })
    const newTasks = response.split('\n')
    const prioritizedTaskList: Task[] = []

    for (const taskString of newTasks) {
        if (!taskString.trim()) {
            // eslint-disable-next-line no-continue
            continue
        }
        const taskParts = taskString.trim().split('. ', 2)
        if (taskParts.length === 2) {
            const task_id = parseInt(taskParts[0].trim(), 10)
            const task_name = taskParts[1].trim()
            prioritizedTaskList.push({ task_id, task_name })
        }
    }

    return prioritizedTaskList
}

export async function get_top_tasks(vectorStore: VectorStore, query: string, k: number): Promise<string[]> {
    const docs = await vectorStore.similaritySearch(query, k)
    let returnDocs: string[] = []
    for (const doc of docs) {
        returnDocs.push(doc.metadata.task)
    }
    return returnDocs
}

async function executeTask(vectorStore: VectorStore, executionChain: LLMChain, objective: string, task: string, k = 5): Promise<string> {
    const context = await get_top_tasks(vectorStore, objective, k)
    return executionChain.predict({ objective, context, task })
}

export class BabyAGI {
    taskList: Array<Task> = []

    taskCreationChain: TaskCreationChain

    taskPrioritizationChain: TaskPrioritizationChain

    executionChain: ExecutionChain

    taskIdCounter = 1

    vectorStore: VectorStore

    maxIterations = 3

    constructor(
        taskCreationChain: TaskCreationChain,
        taskPrioritizationChain: TaskPrioritizationChain,
        executionChain: ExecutionChain,
        vectorStore: VectorStore,
        maxIterations: number
    ) {
        this.taskCreationChain = taskCreationChain
        this.taskPrioritizationChain = taskPrioritizationChain
        this.executionChain = executionChain
        this.vectorStore = vectorStore
        this.maxIterations = maxIterations
    }

    addTask(task: Task) {
        this.taskList.push(task)
    }

    printTaskList() {
        // eslint-disable-next-line no-console
        console.log('\x1b[95m\x1b[1m\n*****TASK LIST*****\n\x1b[0m\x1b[0m')
        // eslint-disable-next-line no-console
        this.taskList.forEach((t) => console.log(`${t.task_id}: ${t.task_name}`))
    }

    printNextTask(task: Task) {
        // eslint-disable-next-line no-console
        console.log('\x1b[92m\x1b[1m\n*****NEXT TASK*****\n\x1b[0m\x1b[0m')
        // eslint-disable-next-line no-console
        console.log(`${task.task_id}: ${task.task_name}`)
    }

    printTaskResult(result: string) {
        // eslint-disable-next-line no-console
        console.log('\x1b[93m\x1b[1m\n*****TASK RESULT*****\n\x1b[0m\x1b[0m')
        // eslint-disable-next-line no-console
        console.log(result)
    }

    getInputKeys(): string[] {
        return ['objective']
    }

    getOutputKeys(): string[] {
        return []
    }

    async call(inputs: Record<string, any>): Promise<string> {
        const { objective } = inputs
        const firstTask = inputs.first_task || '制作一个待办事项清单'
        this.addTask({ task_id: 1, task_name: firstTask })
        let numIters = 0
        let loop = true
        let finalResult = ''

        while (loop) {
            if (this.taskList.length) {
                this.printTaskList()

                // Step 1: Pull the first task
                const task = this.taskList.shift()
                if (!task) break
                this.printNextTask(task)

                // Step 2: Execute the task
                const result = await executeTask(this.vectorStore, this.executionChain, objective, task.task_name)
                const thisTaskId = task.task_id
                finalResult = result
                this.printTaskResult(result)

                // Step 3: Store the result in Pinecone
                const docs = new Document({ pageContent: result, metadata: { task: task.task_name } })
                this.vectorStore.addDocuments([docs])

                // Step 4: Create new tasks and reprioritize task list
                const newTasks = await getNextTask(
                    this.taskCreationChain,
                    result,
                    task.task_name,
                    this.taskList.map((t) => t.task_name),
                    objective
                )
                newTasks.forEach((newTask) => {
                    this.taskIdCounter += 1
                    // eslint-disable-next-line no-param-reassign
                    newTask.task_id = this.taskIdCounter
                    this.addTask(newTask)
                })
                this.taskList = await prioritizeTasks(this.taskPrioritizationChain, thisTaskId, this.taskList, objective)
            }

            numIters += 1
            if (this.maxIterations !== null && numIters === this.maxIterations) {
                // eslint-disable-next-line no-console
                console.log('\x1b[91m\x1b[1m\n*****TASK ENDING*****\n\x1b[0m\x1b[0m')
                loop = false
                this.taskList = []
            }
        }

        return finalResult
    }

    static fromLLM(llm: BaseChatModel, vectorstore: VectorStore, maxIterations = 3): BabyAGI {
        const taskCreationChain = TaskCreationChain.from_llm(llm)
        const taskPrioritizationChain = TaskPrioritizationChain.from_llm(llm)
        const executionChain = ExecutionChain.from_llm(llm)
        return new BabyAGI(taskCreationChain, taskPrioritizationChain, executionChain, vectorstore, maxIterations)
    }
}
