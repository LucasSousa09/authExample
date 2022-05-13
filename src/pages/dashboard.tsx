import { useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"
import { setupApiClient } from "../services/api"
import { api } from "../services/apiClient"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard(){
    const { user } = useContext(AuthContext)

    useEffect(() => {
        api.get('/me')
        .then(response => console.log(response.data))
        .catch((err) => {
            console.log(err)
        })
    },[])

    return (
        <>
            <h1>Dashboard</h1>

            {
                user && (
                    <>
                        <p>{user.email}</p>
                        <p>{user.permissions}</p>
                        <p>{user.roles}</p>
                    </>
                )
            }
        </>
    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupApiClient(ctx)
    const response = await apiClient.get('/me')
    
    console.log(response)
    return{ 
        props: {}
    }
})