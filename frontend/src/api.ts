import useSWR from "swr"
import {responseInterface} from "swr/dist/types";
import {Rectangle, Size} from "./utils/types";
import React from "react";
import {ImageInfo} from "./utils/useImageInfo";

// @ts-ignore
const fetcher = (...args) => fetch(...args).then(res => res.json())


// Types

export declare type Image = {
    element?: HTMLImageElement,
    size?: Size,
}

export declare type ImageData = {
    annotations?: Rectangle[],
    tags?: string[],
}

// Hooks API

export function useFileList(): responseInterface<any, any> {
    return useSWR('/api/files', fetcher)
}

export function useImage(key?: string): [Image | null] {
    // Ref: https://github.com/konvajs/use-image/blob/master/index.js
    const url = '/api/file/image/' + key;
    const [state, setState] = React.useState<Image | null>(null);

    React.useEffect(
        function () {
            if (!url) {
                return;
            }
            const img = document.createElement('img');

            function onload() {
                setState({
                    element: img,
                    size: {width: img.width, height: img.height}
                });
            }

            function onerror() {
                setState(null);
            }

            img.addEventListener('load', onload);
            img.addEventListener('error', onerror);
            img.src = url;

            return function cleanup() {
                img.removeEventListener('load', onload);
                img.removeEventListener('error', onerror);
                setState(null);
            };
        }, [url]
    );

    return [state];
}

export function useImageData(key: string): [ImageData, (data: ImageData) => void] {
    const url = '/api/file/image_data/' + key;
    const {data, mutate} = useSWR(url, fetcher)
    const setData = async (data: ImageData) => {
        const newData = await fetch(url, {
            method: "PUT",
            body: JSON.stringify(data)
        })

        mutate(newData)
    }

    return [data, setData];
}
