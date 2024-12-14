import axios from 'axios'

const getApiUrl = () => process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
    : process.env.NEXT_PUBLIC_API_URL_DEV

export const api = {
    async getUserPlan(token: string) {
        const response = await fetch(`${getApiUrl()}/user/plan`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.json()
    },

    async getNotebooks(token: string) {
        const response = await fetch(`${getApiUrl()}/notebooks`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.json()
    },

    async getQuestionBanks(token: string) {
        const response = await fetch(`${getApiUrl()}/user/question-banks`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.json()
    },

    async deleteNotebook(notebookId: string, token: string) {
        await axios.delete(`${getApiUrl()}/notebooks/${notebookId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
    }
}