import useSWR from "swr"
import {responseInterface} from "swr/dist/types";

// @ts-ignore
const fetcher = (...args) => fetch(...args).then(res => res.json())


// Types




// Hooks API

export function useFileList(): responseInterface<any, any> {
    return useSWR('/api/files', fetcher)
}

export function useImageData(key: string): [any, any] {
    const url = '/api/file/image_data/' + key;
    const {data, mutate} = useSWR(url, fetcher)
    const setData = async (data: any) => {
        const newData = await fetch(url, {
            method: "PUT",
            body: JSON.stringify(data)
        })

        mutate(newData)
    }

    return [data, setData];
}

function postData(key: string, data: any) {
    return fetch('/api/file/image/' + key, {
        method: "PUT",
        body: JSON.stringify(data)
    })
}
