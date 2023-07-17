<!-- markdownlint-disable MD030 -->

# Flowise 中文

<a href="https://github.com/FlowiseAI/Flowise">
<img width="100%" src="https://github.com/FlowiseAI/Flowise/blob/main/images/flowise.gif?raw=true"></a>

拖拽出你自己的 LLM 流

## ⚡ 快速开始

下载并安装 [NodeJS](https://nodejs.org/en/download) >= 18.15.0

1. 安装 Flowise
    ```bash
    npm install -g flowise
    ```
2. 启动 Flowise

    ```bash
    npx flowise start
    ```

    想要使用 username & password ?

    ```bash
    npx flowise start --FLOWISE_USERNAME=user --FLOWISE_PASSWORD=1234
    ```

3. 打开 [http://localhost:3000](http://localhost:3000)

## 🐳 Docker

### Docker Compose

1. 跳转到位于项目根目录的 `docker` 文件夹
2. 创建 `.env` 文件并指定 `PORT` (参考 `.env.example`)
3. `docker-compose up -d`
4. 打开 [http://localhost:3000](http://localhost:3000)
5. 你可以运行这条命令停止运行 `docker-compose stop`

### Docker Image

1. 本地构建镜像:
    ```bash
    docker build --no-cache -t flowise .
    ```
2. 启动镜像:

    ```bash
    docker run -d --name flowise -p 3000:3000 flowise
    ```

3. 停止服务:
    ```bash
    docker stop flowise
    ```

## 👨‍💻 开发者相关

Flowise 有 3 个 不同的模块在这个 monorepo 中.

-   `server`: Node 实现的后端逻辑
-   `ui`: React 实现的前端
-   `components`: Langchain 组件

### 前置条件

-   安装 [Yarn v1](https://classic.yarnpkg.com/en/docs/install)
    ```bash
    npm i -g yarn
    ```

### 启动

1. 克隆这个仓库

    ```bash
    git clone https://github.com/MH-14/Flowise-ZH.git
    ```

2. 进入仓库文件夹

    ```bash
    cd Flowise
    ```

3. 安装所有模块需要的依赖:

    ```bash
    yarn install
    ```

4. 构建全部的代码:

    ```bash
    yarn build
    ```

5. 启动应用:

    ```bash
    yarn start
    ```

    你能在这里访问到应用 [http://localhost:3000](http://localhost:3000)

6. 对于开发者的方式:

    - Create `.env` file and specify the `PORT` (refer to `.env.example`) in `packages/ui`
    - Create `.env` file and specify the `PORT` (refer to `.env.example`) in `packages/server`
    - Run

        ```bash
        yarn dev
        ```

    任何代码的改变都将让应用重新加载 [http://localhost:8080](http://localhost:8080)

## 🔒 认证

要开启应用层的认证, 在 `packages/server` 下的 `.env` 添加 `FLOWISE_USERNAME` 和 `FLOWISE_PASSWORD`:

```
FLOWISE_USERNAME=user
FLOWISE_PASSWORD=1234
```

## 🌱 Env Variables

Flowise support different environment variables to configure your instance. You can specify the following variables in the `.env` file inside `packages/server` folder.

| Variable         | Description                                                      | Type                                             | Default                             |
| ---------------- | ---------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------- |
| PORT             | The HTTP port Flowise runs on                                    | Number                                           | 3000                                |
| FLOWISE_USERNAME | Username to login                                                | String                                           |
| FLOWISE_PASSWORD | Password to login                                                | String                                           |
| DEBUG            | Print logs from components                                       | Boolean                                          |
| LOG_PATH         | Location where log files are stored                              | String                                           | `your-path/Flowise/logs`            |
| LOG_LEVEL        | Different levels of logs                                         | Enum String: `error`, `info`, `verbose`, `debug` | `info`                              |
| DATABASE_PATH    | Location where database is saved                                 | String                                           | `your-home-dir/.flowise`            |
| APIKEY_PATH      | Location where api keys are saved                                | String                                           | `your-path/Flowise/packages/server` |
| EXECUTION_MODE   | Whether predictions run in their own process or the main process | Enum String: `child`, `main`                     | `main`                              |

You can also specify the env variables when using `npx`. For example:

```
npx flowise start --PORT=3000 --DEBUG=true
```

## 📖 官方文档

[Flowise Docs](https://docs.flowiseai.com/)

## 🌐 自机部署

### [Railway](https://docs.flowiseai.com/deployment/railway)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/pn4G8S?referralCode=WVNPD9)

### [Render](https://docs.flowiseai.com/deployment/render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://docs.flowiseai.com/deployment/render)

### [AWS](https://docs.flowiseai.com/deployment/aws)

### [Azure](https://docs.flowiseai.com/deployment/azure)

### [DigitalOcean](https://docs.flowiseai.com/deployment/digital-ocean)

### [GCP](https://docs.flowiseai.com/deployment/gcp)

## 💻 云部署

马上到

## 🙋 支持

随意提问, 有新特性需求一起[讨论](https://github.com/FlowiseAI/Flowise/discussions)

## 🙌 贡献者

See [contributing guide](CONTRIBUTING.md). Reach out to us at [Discord](https://discord.gg/jbaHfsRVBW) if you have any questions or issues.
[![Star History Chart](https://api.star-history.com/svg?repos=FlowiseAI/Flowise&type=Timeline)](https://star-history.com/#FlowiseAI/Flowise&Date)

## 📄 证书

Source code in this repository is made available under the [MIT License](LICENSE.md).
