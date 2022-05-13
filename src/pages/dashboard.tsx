import { useContext, useEffect } from "react"
import { Can } from "../components/Can"
import { AuthContext } from "../context/AuthContext"
import { setupApiClient } from "../services/api"
import { api } from "../services/apiClient"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard(){
    const { user, signOut } = useContext(AuthContext)

    useEffect(() => {
        api.get('/me')
        .then(response => console.log(response.data))
        .catch((err) => {
            console.log(err)
        })
    },[])

    return (
        <>
            <h1>Dashboard {user?.email}</h1>
            <button className='rounded-sm mt-6 py-2 px-4 text-zinc-800 font-bold bg-zinc-300' onClick={signOut}>Sign Out</button>
        </>
    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupApiClient(ctx)
    const response = await apiClient.get('/me')
    
    return{ 
        props: {}
    }
})