import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie} from 'nookies'
import { signOut } from '../context/AuthContext'
import { AuthTokenError } from '../errors/AuthTokenError'

interface AxiosErrorReponse{
    code?: string
}

let isRefreshing = false
let failedRequestQueue = [];

export function setupApiClient(ctx = undefined) {

    let cookies = parseCookies(ctx)

    const api = axios.create({
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
    
                cookies = parseCookies(ctx)
    
                const {'nextauth.refreshToken': refreshToken} = cookies
                const originalConfig = error.config // Dentro desse config temos todos os dados necesários para repetir uma requisição no backend
    
                if(!isRefreshing){
                    isRefreshing = true
    
                    api.post('/refresh', {
                        refreshToken,
                    }).then(response => {
                        const { token } = response.data
        
                        setCookie(ctx, 'nextauth.token', token, {
                            maxAge: 60 * 60 * 24 * 30, //30 days
                            path: '/' //Quais caminhos da aplicação tem acesso ao Cookie, '/' significa que todos os caminhos tem acesso ao cookie
                        })
            
                        setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
                            maxAge: 60 * 60 * 24 * 30, //30 days
                            path: '/'
                        })
        
                        api.defaults.headers['Authorization'] = `Bearer ${token}`
    
                        failedRequestQueue.forEach(request => request.onSuccess(token))
                        failedRequestQueue = []
                    }).catch(err => {
                        failedRequestQueue.forEach(request => request.onFailure(err))
                        failedRequestQueue = []
    
                        if (typeof window !== "undefined") {
                            signOut();
                        }
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
                if (typeof window !== "undefined") {
                    signOut();
                } else {
                    return Promise.reject(new AuthTokenError)
                }
            }
        }
    
        return Promise.reject(error)
    })

    return api
}