import React, {useCallback, useState} from "react";
import {Image, Layer, Rect, Stage} from "react-konva";
import {
    applyTransformation, DEFAULT_IDENTITY_TRANSFORMATION, movePoint,
    Point,
    Rectangle, revertTransformation,
    transformationFittingToFrame, transformationWithAdjustment
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
    isAnnotating: boolean,
    annotations: Annotation[],
    selectedAnnotation?: number,
    onSelectAnnotation?: (index?: number) => void
    onChangeAnnotations?: (annotations: Annotation[]) => void
}) {
    const {image, width, height, annotations, isAnnotating} = props;
    const selectedAnnotation = props.selectedAnnotation;
    const onSelectAnnotation = props.onSelectAnnotation || (() => null);
    const onChangeAnnotations = props.onChangeAnnotations || (() => null);

    const [annotationBegin, setAnnotationBegin] = React.useState<boolean>(false);
    const [draggingBegin, setDraggingBegin] = React.useState<any>(null);
    const [draggingCurrent, setDraggingCurrent] = React.useState<any>(null);

    const [viewScale, setViewScale] = useState<number>(1);
    const [viewOffset, setViewOffset] = useState<Point>({x: 0, y: 0});

    const frameSize = {width, height};
    let frameTransform = image.element ? transformationFittingToFrame(frameSize, image) : DEFAULT_IDENTITY_TRANSFORMATION;
    frameTransform = transformationWithAdjustment(frameTransform, viewScale, viewOffset);

    const onMouseDown = useCallback((e: any) => {
        const clickedOnEmpty = (e.target === e.target.getStage() || e.target.image);
        if (clickedOnEmpty) {
            // Deselect when clicked on empty area
            if (selectedAnnotation !== undefined) {
                onSelectAnnotation(undefined);
                return;
            }
            setAnnotationBegin(isAnnotating);
            setDraggingBegin({x: e.evt.layerX, y: e.evt.layerY});
            setDraggingCurrent({x: e.evt.layerX, y: e.evt.layerY});
        }
    }, [isAnnotating, selectedAnnotation, onSelectAnnotation, setAnnotationBegin, setDraggingBegin, setDraggingCurrent])

    const onMouseUp = useCallback((e: any) => {
        if (draggingBegin) {
            setDraggingBegin(null);
            setDraggingCurrent(null);
            setAnnotationBegin(false);
            if (annotationBegin) {
                const newAnnotation = rectangleFromTwoPoint(draggingBegin, draggingCurrent);
                if (newAnnotation.width < 10 || newAnnotation.height < 10) {
                    return;
                }

                const rects = annotations.slice();
                rects.push(revertTransformation(frameTransform, newAnnotation));
                onChangeAnnotations(rects);
                onSelectAnnotation(rects.length - 1);
            }
        }
    }, [annotations, isAnnotating, draggingBegin, draggingCurrent, frameTransform, setDraggingBegin, setDraggingCurrent, onChangeAnnotations])

    const onMouseLeave = useCallback((e: any) => {
        setDraggingBegin(null);
        setDraggingCurrent(null);
        setAnnotationBegin(false);
    }, [setDraggingBegin, setAnnotationBegin, setDraggingCurrent])

    const onMouseMove = useCallback((e: any) => {
        if (!draggingBegin) {
            return;
        }
        const draggingCurrent = {x: e.evt.layerX, y: e.evt.layerY};
        setDraggingCurrent(draggingCurrent);
        if (!annotationBegin) {
            setViewOffset(movePoint(
                draggingCurrent.x - draggingBegin.x,
                draggingCurrent.y - draggingBegin.y,
                viewOffset
            ));
        }
    }, [annotationBegin, draggingBegin, setViewOffset, setDraggingCurrent])

    if (!image.element) {
        // Todo: handle image loading or empty
        return <ImageFrame/>
    }

    return <ImageFrame
        className={
            ((selectedAnnotation !== undefined) ? 'selected-annotation ' : ' ') +
            ((isAnnotating || annotationBegin) ? 'annotating ' : ' ') +
            (draggingCurrent ? 'dragging ' : ' ')
        }
    >
        <Toolbar>
            <button onClick={() => {
                setViewScale(1.0);
                setViewOffset({x: 0, y: 0});
            }
            }>Reset
            </button>
            <button onClick={() => setViewScale(viewScale * 1.1)}>+</button>
            <button onClick={() => setViewScale(viewScale / 1.1)}>-</button>
        </Toolbar>
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
                    annotationBegin && draggingBegin && draggingCurrent &&
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
    cursor: grab;
    
    &.dragging {
        cursor: grabbing;
    }
    
    &.annotating,
    &.annotating.dragging{
        cursor: crosshair;
    }
    
    &.selected-annotation {
        cursor: default;
    }
`;

const Toolbar = styled.div`
    position: absolute;
    top:10px;
    left:10px;
    z-index:100;
    
    button {
        padding: 0 8px;
        margin: 0 2px;
    }
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
