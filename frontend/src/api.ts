import useSWR from "swr"
import {responseInterface} from "swr/dist/types";

// @ts-ignore
const fetcher = (...args) => fetch(...args).then(res => res.json())


// Types

interface FileStatus {
    type: string
}

type FileList = {
  [filename: string]: FileStatus;
}

// Hooks API

export function useFileBrowsing(path: string) : responseInterface<FileList, any> {
    const apiPath = path ? ('/api/files/ls/' + path) : '/api/files/ls'
    return useSWR(apiPath, fetcher)
}
