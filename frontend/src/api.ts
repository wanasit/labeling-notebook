import useSWR from "swr"
import {responseInterface} from "swr/dist/types";

// @ts-ignore
const fetcher = (...args) => fetch(...args).then(res => res.json())


//

interface User {
    username: string
}

interface DebugStatus {
    user?: User,
    serverTime: number
}

// Hooks API

export function useDebugStatusAPI() : responseInterface<DebugStatus, any> {
    return useSWR('/api/debug', fetcher)
}
