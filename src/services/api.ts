import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie} from 'nookies'
import { signOut } from '../context/AuthContext'

interface AxiosErrorReponse{
    code?: string
}

let cookies = parseCookies()
let isRefreshing = false
let failedRequestQueue = [];

export const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
        Authorization: `Bearer ${cookies['nextauth.token']}`
    }
})

api.interceptors.response.use(response => {
    return response
}, (error: AxiosError<AxiosErrorReponse>) => {
    if(error.response.status === 401){
        if(error.response.data?.code === 'token.expired'){
            //Renovar token

            cookies = parseCookies()

            const {'nextauth.refreshToken': refreshToken} = cookies
            const originalConfig = error.config // Dentro desse config temos todos os dados necesários para repetir uma requisição no backend

            if(!isRefreshing){
                isRefreshing = true

                api.post('/refresh', {
                    refreshToken,
                }).then(response => {
                    const { token } = response.data
    
                    setCookie(undefined, 'nextauth.token', token, {
                        maxAge: 60 * 60 * 24 * 30, //30 days
                        path: '/' //Quais caminhos da aplicação tem acesso ao Cookie, '/' significa que todos os caminhos tem acesso ao cookie
                    })
        
                    setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
                        maxAge: 60 * 60 * 24 * 30, //30 days
                        path: '/'
                    })
    
                    api.defaults.headers['Authorization'] = `Bearer ${token}`

                    failedRequestQueue.forEach(request => request.onSuccess(token))
                    failedRequestQueue = []
                }).catch(err => {
                    failedRequestQueue.forEach(request => request.onFailure(err))
                    failedRequestQueue = []
                }).finally(() => {
                    isRefreshing = false
                })
            }


            //Não é possível utilizar async await dentro do interceptor
            //Por conta disso é nessário utilizar uma Promise a fim de realizar uma chamada assincrona
            //reject & resolve são os parametros padrões de uma Promise 
            
            return new Promise((resolve, reject) => {
                failedRequestQueue.push({
                    onSuccess: (newToken: string) => {
                        originalConfig.headers['Authorization'] = `Bearer ${newToken}`

                        resolve(api(originalConfig))
                    },

                    onFailure:  (err:AxiosError) => {
                        reject(err)
                    }
                })
            })
        }
        else{
            signOut()
        }
    }

    return Promise.reject(error)
})