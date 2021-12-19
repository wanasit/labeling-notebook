import { useState, useCallback, useLayoutEffect } from "react";
import {Rectangle} from "./shapes";

export type UseDimensionsHook = [
    (node: HTMLElement) => void,
    Rectangle | undefined,
    HTMLElement
];

export interface UseDimensionsArgs {
    liveMeasure?: boolean;
}

export function useDimensions({
    liveMeasure = true
}: UseDimensionsArgs = {}): UseDimensionsHook {
    const [dimensions, setDimensions] = useState({});
    const [node, setNode] = useState(null);

    const ref = useCallback(node => {
        setNode(node);
    }, []);

    useLayoutEffect(() => {
        if (node) {

            const measure = () =>
                window.requestAnimationFrame(() =>
                    // @ts-ignore
                    setDimensions(getDimensionObject(node))
                );
            measure();

            if (liveMeasure) {
                window.addEventListener("resize", measure);
                window.addEventListener("scroll", measure);

                return () => {
                    window.removeEventListener("resize", measure);
                    window.removeEventListener("scroll", measure);
                };
            }
        }
    }, [node]);

    // @ts-ignore
    return [ref, dimensions, node];
}


function getDimensionObject(node: HTMLElement): Rectangle {
    const rect = node.getClientRects()[0];

    return {
        // @ts-ignore
        x: "x" in rect ? rect.x : rect.left,
        // @ts-ignore
        y: "y" in rect ? rect.y : rect.top,
        width: rect.width,
        height: rect.height,
    };
}
