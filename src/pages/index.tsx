import { FormEvent, useContext, useState } from "react"
import { AuthContext } from "../context/AuthContext"
import { withSSRGuest } from "../utils/withSSRGuest"


export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { signIn } = useContext(AuthContext)

  async function handleSubmit(evt: FormEvent) {
    evt.preventDefault()    

    const data = {
      email,
      password
    }

    await signIn(data)
  }

  return (
    <div className='flex h-screen justify-center items-center'>
      <form onSubmit={handleSubmit} className='flex flex-col w-2/5'>
        <label htmlFor="email">E-mail</label>
        <input className='text-zinc-800 rounded-sm' type="email" name='email' value={email} onChange={evt => setEmail(evt.target.value)} />
        
        <label htmlFor="password">Senha</label>
        <input className='text-zinc-800 rounded-sm' type="password" name='password' value={password} onChange={evt => setPassword(evt.target.value)} />
        
        <button className='rounded-sm mt-6 py-2 text-zinc-800 font-bold bg-zinc-300' type='submit'>Enviar</button>    
      </form>
    </div>
  )
}


export const getServerSideProps = withSSRGuest(async (ctx) => {
  return {
    props: {}
  }
}) 