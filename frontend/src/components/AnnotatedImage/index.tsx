import React, {useCallback} from "react";
import {Image, Layer, Rect, Stage, Transformer} from "react-konva";
import {
    applyTransformation, DEFAULT_IDENTITY_TRANSFORMATION,
    Point,
    Rectangle, revertTransformation, Transformation,
    transformationFittingToFrame
} from "../../utils/shapes";
import styled from "styled-components";
import ComponentAnnotation from "./ComponentAnnotation";
import {Annotation, DEFAULT_ANNOTATION_COLOR, DEFAULT_ANNOTATION_SELECTED_COLOR} from "../../api";


interface LoadedImageElement {
    readonly element: HTMLImageElement,
    readonly width: number;
    readonly height: number;
}

interface LoadingImageElement {
    readonly element: null | undefined;
}

export type InputImage = LoadedImageElement | LoadingImageElement;
export default function AnnotatedImage(props: {
    image: InputImage,
    width: number,
    height: number,
    annotations: Annotation[],
    selectedAnnotation?: number,
    onSelectAnnotation?: (index?: number) => void
    onChangeAnnotations?: (annotations: Annotation[]) => void
}) {
    const {image, width, height, annotations, onChangeAnnotations} = props;

    const selectedAnnotation = props.selectedAnnotation;
    const onSelectAnnotation = props.onSelectAnnotation || ((index) => {
    });

    const [draggingBegin, setDraggingBegin] = React.useState<any>(null);
    const [draggingCurrent, setDraggingCurrent] = React.useState<any>(null);
    const frameSize = {width, height};


    const frameTransform: Transformation = image.element ? transformationFittingToFrame(frameSize, image)
        : DEFAULT_IDENTITY_TRANSFORMATION;

    const onMouseDown = useCallback((e: any) => {
        // deselect when clicked on empty area
        const clickedOnEmpty = (e.target === e.target.getStage() || e.target.image);
        if (clickedOnEmpty) {
            if (selectedAnnotation !== undefined) {
                onSelectAnnotation(undefined);
            } else {
                setDraggingBegin({x: e.evt.layerX, y: e.evt.layerY});
                setDraggingCurrent({x: e.evt.layerX, y: e.evt.layerY});
            }
        }
    }, [selectedAnnotation, onSelectAnnotation, setDraggingBegin, setDraggingCurrent])

    const onMouseUp = useCallback((e: any) => {
        if (draggingBegin) {
            setDraggingBegin(null);
            setDraggingCurrent(null);

            const newAnnotation = rectangleFromTwoPoint(draggingBegin, draggingCurrent);
            if (newAnnotation.width < 10 || newAnnotation.height < 10) {
                return;
            }

            const rects = annotations.slice();
            rects.push(revertTransformation(frameTransform, newAnnotation));
            if (onChangeAnnotations) {
                onChangeAnnotations(rects);
            }
            onSelectAnnotation(rects.length - 1);
        }
    }, [annotations, draggingBegin, draggingCurrent, frameTransform, setDraggingBegin, setDraggingCurrent, onChangeAnnotations])

    const onMouseLeave = useCallback((e: any) => {
        setDraggingBegin(null);
        setDraggingCurrent(null);
    }, [selectedAnnotation, setDraggingCurrent])

    const onMouseMove = useCallback((e: any) => {
        if (draggingBegin) {
            setDraggingCurrent({x: e.evt.layerX, y: e.evt.layerY});
        }
    }, [draggingBegin, setDraggingCurrent])

    if (!image.element) {
        // Todo: handle image loading or empty
        return <ImageFrame/>
    }

    return <ImageFrame>
        <Stage
            {...frameSize}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
        >
            <Layer>
                <Image
                    image={image.element}
                    {...applyTransformation(frameTransform, {x: 0, y: 0, ...image})}
                />
                {
                    annotations.map((rect, i) => {
                        const selected = selectedAnnotation === i;
                        const color = rect.color || (selected ? DEFAULT_ANNOTATION_SELECTED_COLOR : DEFAULT_ANNOTATION_COLOR)

                        return <ComponentAnnotation
                            key={i}
                            color={color}
                            rect={applyTransformation(frameTransform, rect)}
                            isSelected={i === selectedAnnotation}
                            onSelect={() => onSelectAnnotation(i)}
                            onRectChange={(newAttrs: any) => {
                                const rects = annotations.slice();
                                rects[i] = revertTransformation(frameTransform, newAttrs);
                                if (onChangeAnnotations) {
                                    onChangeAnnotations(rects);
                                }
                            }}
                        />
                    })
                }
                {
                    draggingBegin && draggingCurrent &&
                    <Rect {...rectangleFromTwoPoint(draggingBegin, draggingCurrent)} fill={'rgba(1, 1,1,0.5)'}/>
                }

            </Layer>
        </Stage>
    </ImageFrame>
};


const ImageFrame = styled.div`
    position: relative;
    overflow-x: hidden;
    height: 100%;
    width: 100%;
    background-color:#eee;
`;


function rectangleFromTwoPoint(p1: Point, p2: Point): Rectangle {
    const left = Math.min(p1.x, p2.x);
    const right = Math.max(p1.x, p2.x);
    const top = Math.min(p1.y, p2.y);
    const bottom = Math.max(p1.y, p2.y);
    return {
        x: left, y: top, width: right - left, height: bottom - top
    }
}
