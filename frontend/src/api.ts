import useSWR from "swr"
import {responseInterface} from "swr/dist/types";
import {Rectangle} from "./utils/shapes";
import React from "react";
import ColorHash from "color-hash";

// @ts-ignore
const fetcher = (...args) => fetch(...args).then(res => {
    if (!res.ok) {
        return null;
    }

    return res.json()
});


// Types
export const DEFAULT_ANNOTATION_COLOR = new ColorHash({lightness: 0.5, saturation: 0.7, hue: 220}).hex('');
export const DEFAULT_ANNOTATION_SELECTED_COLOR = new ColorHash({lightness: 0.5, saturation: 1.0, hue: 200}).hex('');

export interface Image {
    key: string,
    element: HTMLImageElement,
    width: number,
    height: number,
}

export interface ImageData {
    annotations?: Annotation[],
    tags?: string[],
}

export interface Annotation extends Rectangle {
    color?: string,
    label?: string
}

// Hooks API

export function useFileList(): responseInterface<any, any> {
    return useSWR('/api/files', fetcher)
}

export function usePluginMap(): responseInterface<any, any> {
    return useSWR('/api/plugins', fetcher)
}

export function useImage(key?: string | null): [Image | null] {
    // Ref: https://github.com/konvajs/use-image/blob/master/index.js
    const url = key ? '/api/files/image/' + key : null;
    const [state, setState] = React.useState<Image | null>(null);

    React.useEffect(
        function () {
            if (!url) {
                return;
            }
            const img = document.createElement('img');

            function onload() {
                setState({
                    key: key || '',
                    element: img,
                    width: img.width,
                    height: img.height
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

export function useImageData(key?: string | null): [ImageData | undefined, (data: ImageData) => void, () => void] {
    const url = key ? '/api/files/image_data/' + key : '';
    const {data, mutate} = useSWR(url, fetcher)
    const setData = async (data: ImageData) => {
        const newData = await fetch(url, {
            method: "PUT",
            body: JSON.stringify(data)
        })

        mutate({...data, ...newData})
    }
    const reloadData = () => {
        mutate();
    }

    return [data, setData, reloadData];
}

export function applyPlugIn(name: string, key: string): Promise<any> {
    const url = `/api/plugins/${name}/apply/${key}`;
    const data = {};
    return fetch(url, {
        method: "POST",
        body: JSON.stringify(data)
    });
}

