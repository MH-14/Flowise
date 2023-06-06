// assets
import { IconTrash, IconFileUpload, IconFileExport, IconCopy } from '@tabler/icons'

// constant
const icons = { IconTrash, IconFileUpload, IconFileExport, IconCopy }

// ==============================|| SETTINGS MENU ITEMS ||============================== //

const settings = {
    id: 'settings',
    title: '',
    type: 'group',
    children: [
        {
            id: 'duplicateChatflow',
            title: '复制 Chatflow',
            type: 'item',
            url: '',
            icon: icons.IconCopy
        },
        {
            id: 'loadChatflow',
            title: '加载 Chatflow',
            type: 'item',
            url: '',
            icon: icons.IconFileUpload
        },
        {
            id: 'exportChatflow',
            title: '导出 Chatflow',
            type: 'item',
            url: '',
            icon: icons.IconFileExport
        },
        {
            id: 'deleteChatflow',
            title: '删除 Chatflow',
            type: 'item',
            url: '',
            icon: icons.IconTrash
        }
    ]
}

export default settings
