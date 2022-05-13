import { useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"
import { api } from "../services/api"

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