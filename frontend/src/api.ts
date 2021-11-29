import useSWR from "swr"
import {responseInterface} from "swr/dist/types";

// @ts-ignore
const fetcher = (...args) => fetch(...args).then(res => res.json())


// Types

// Hooks API




export function useFileList(path: string) : responseInterface<any, any> {
    const apiPath = path ? ('/api/files/ls/' + path) : '/api/files/ls'
    return useSWR(apiPath, fetcher)
}
