import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { parseCookies } from "nookies"


//High Order function => Serve para quando eu quero garantir que uma página não pode ser acessada por um usuário não logado

export function withSSRGuest<P>(fn: GetServerSideProps<P>): GetServerSideProps {
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
        const cookies = parseCookies(ctx)

        if(cookies['nextauth.token']){
          return{
            redirect: {
              destination: '/dashboard',
              permanent: false
            }
          }
        }
        return await fn(ctx)
    }
}