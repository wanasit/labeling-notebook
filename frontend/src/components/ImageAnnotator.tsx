import React, {MutableRefObject, useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {Layer, Stage, Rect, Transformer, Image} from "react-konva";
import {useImageInfo} from "../utils/useImageInfo";
import {useDimensions} from "../utils/dimensions";
import styled from "styled-components";
import {DEFAULT_EMPTY_RECT, Point, Rectangle, Size} from "../utils/types";


const Annotation = (props: any) => {
    const {shapeProps, isSelected, onSelect, onChange} = props;
    const shapeRef: any = React.useRef();
    const trRef: any = React.useRef();

    React.useEffect(() => {
        if (isSelected) {
            // we need to attach transformer manually
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    return (
        <React.Fragment>
            <Rect
                fill={ isSelected ? 'rgba(255, 100, 100, 0.7)': 'rgba(255, 100, 100, 0.3)'}
                onClick={onSelect}
                onTap={onSelect}
                ref={shapeRef}
                {...shapeProps}
                draggable={isSelected}
                onDragEnd={(e) => {
                    onChange({
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
                onTransformEnd={(e) => {
                    // transformer is changing scale of the node
                    // and NOT its width or height
                    // but in the store we have only width and height
                    // to match the data better we will reset scale on transform end
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    // we will reset it back
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        // set minimal value
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(node.height() * scaleY),
                    });
                }}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    rotateEnabled={false}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </React.Fragment>
    );
};


export default function ImageAnnotator(props: {
    src?: string,
    annotations: any[],
    onChangeAnnotations?: (annotations: any[]) => void
}) {
    const {image, imageSize} = useImageInfo(props.src);
    const [ref, dimension] = useDimensions({liveMeasure: true});
    const fittedLocation = fitImageLocation(imageSize, dimension);

    const {annotations, onChangeAnnotations} = props;
    const [selectedId, selectShape] = React.useState(-1);

    const [draggingBegin, setDraggingBegin] = React.useState<any>(null);
    const [draggingCurrent, setDraggingCurrent] = React.useState<any>(null);

    const onMouseDown = (e: any) => {
        // deselect when clicked on empty area
        console.log(e);
        const clickedOnEmpty = (e.target === e.target.getStage() || e.target.image);
        if (clickedOnEmpty) {
            if (selectedId >= 0) {
                selectShape(-1);
            } else  {
                setDraggingBegin({x: e.evt.layerX, y: e.evt.layerY});
                setDraggingCurrent({x: e.evt.layerX, y: e.evt.layerY});
            }
        }
    }

    const onMouseUp = (e: any) => {
        if (draggingBegin) {
            setDraggingBegin(null);
            setDraggingCurrent(null);

            const newAnnotation = rectFromTwoPoint(draggingBegin, draggingCurrent);
            if (newAnnotation.width < 10 || newAnnotation.height < 10) {
                return;
            }

            const rects = annotations.slice();
            rects.push(newAnnotation);

            selectShape(rects.length - 1);
            if (onChangeAnnotations) {
                onChangeAnnotations(rects);
            }
        }
    }

    const onMouseLeave = (e: any) => {
        setDraggingBegin(null);
        setDraggingCurrent(null);
    }

    const onMouseMove = (e: any) => {
        if (draggingBegin) {
            setDraggingCurrent({x: e.evt.layerX, y: e.evt.layerY});
        }
    }


    const checkDeselect = (e: any) => {
        // deselect when clicked on empty area
        console.log(e);
        const clickedOnEmpty = (e.target === e.target.getStage() || e.target.image);
        if (clickedOnEmpty) {
            selectShape(-1);
        }
    };


    return <ImageFrame ref={
        // @ts-ignore
        (x) => ref(x)
    }>
        <Stage
            width={dimension?.width} height={dimension?.height}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
        >
            <Layer>
                <Image
                    image={image}
                    x={fittedLocation.x}
                    y={fittedLocation.y}
                    width={fittedLocation.width}
                    height={fittedLocation.height}
                />
                {
                    annotations.map((rect, i) => {
                        return <Annotation
                            key={i}
                            shapeProps={rect}
                            isSelected={i === selectedId}
                            onSelect={() => {
                                selectShape(i);
                            }}
                            onChange={(newAttrs: any) => {
                                const rects = annotations.slice();
                                rects[i] = newAttrs;
                                if (onChangeAnnotations) {
                                    onChangeAnnotations(rects);
                                }
                            }}
                        />
                    })
                }
                {
                    draggingBegin && draggingCurrent && <Rect {...rectFromTwoPoint(draggingBegin, draggingCurrent)} fill={'rgba(1, 1,1,0.5)'}/>
                }

            </Layer>

        </Stage>
    </ImageFrame>
};

function rectFromTwoPoint(p1: Point, p2: Point): Rectangle {
    const left = Math.min(p1.x, p2.x);
    const right = Math.max(p1.x, p2.x);
    const top = Math.min(p1.y, p2.y);
    const bottom = Math.max(p1.y, p2.y);
    return {
        x: left, y: top, width: right - left, height: bottom - top
    }
}


function fitImageLocation(imageSize?: Size, frameSize?: Size): Rectangle {

    if (!imageSize || !frameSize) {
        return DEFAULT_EMPTY_RECT;
    }

    let fittingImageWidth;
    let fittingImageHeight = imageSize.height * frameSize.width / imageSize.width;

    if (fittingImageHeight > frameSize.height) {
        // Fit-Y
        fittingImageHeight = frameSize.height;
        fittingImageWidth = imageSize.width * fittingImageHeight / imageSize.height;
        const paddingWidth = frameSize.width - fittingImageWidth;

        return {
            x: paddingWidth / 2, y: 0,
            width: fittingImageWidth,
            height: fittingImageHeight
        }
    } else {
        // Fit-X
        fittingImageWidth = frameSize.width;
        fittingImageHeight = imageSize.height * fittingImageWidth / imageSize.width;
        const paddingHeight = frameSize.height - fittingImageHeight;

        return {
            x: 0, y: paddingHeight / 2,
            width: fittingImageWidth,
            height: fittingImageHeight
        }
    }
}

const ImageFrame = styled.div`
    position: relative;
    overflow-x: hidden;
    height: 100%;
    width: 100%;
`;