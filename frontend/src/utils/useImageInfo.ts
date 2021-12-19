import React from "react";
import {Size} from "./shapes";

/**
 * Improved version from useImage
 * Ref: https://github.com/konvajs/use-image/blob/master/index.js
 */

const DEFAULT_STATUS: ImageInfo = {image: undefined, status: 'loading'};

export declare type ImageInfo = {
    status:  'loading' | 'loaded' | 'failed'
    image?: HTMLImageElement,
    imageSize?: Size,
}

export function useImageInfo(url?: string, crossOrigin?: string) : ImageInfo{
    const [state, setState] = React.useState(DEFAULT_STATUS);

    React.useEffect(
        function () {
            if (!url) {
                return;
            }
            const img = document.createElement('img');

            function onload() {
                setState({
                    status: 'loaded',
                    image: img,
                    imageSize: { width: img.width, height: img.height}
                });
            }

            function onerror() {
                setState({status: 'failed', image: undefined});
            }

            img.addEventListener('load', onload);
            img.addEventListener('error', onerror);
            crossOrigin && (img.crossOrigin = crossOrigin);
            img.src = url;

            return function cleanup() {
                img.removeEventListener('load', onload);
                img.removeEventListener('error', onerror);
                setState(DEFAULT_STATUS);
            };
        },
        [url, crossOrigin]
    );

    return state;
}