import React from "react";
import {Image, Layer, Rect, Stage, Transformer} from "react-konva";
import {
    applyTransformation,
    DEFAULT_EMPTY_RECT,
    Point,
    Rectangle, revertTransformation,
    Size,
    transformationFittingToFrame
} from "../../utils/shapes";
import styled from "styled-components";

interface Annotation extends Rectangle {
    color?: string
}


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
    selectedAnnotation?: number | null,
    onSelectAnnotation?: (index?: number) => void
    onChangeAnnotations?: (annotations: Annotation[]) => void
}) {
    const {image, width, height, annotations, onChangeAnnotations} = props;
    const selectedAnnotation = props.selectedAnnotation;
    const onSelectAnnotation = props.onSelectAnnotation || ((index) => {});

    const [draggingBegin, setDraggingBegin] = React.useState<any>(null);
    const [draggingCurrent, setDraggingCurrent] = React.useState<any>(null);
    if (!image.element) {
        // Todo: handle image loading or empty
        return <ImageFrame/>
    }

    const frameSize = {width, height};
    const frameTransform = transformationFittingToFrame(frameSize, image);

    const onMouseDown = (e: any) => {
        // deselect when clicked on empty area
        const clickedOnEmpty = (e.target === e.target.getStage() || e.target.image);
        if (clickedOnEmpty) {
            if (selectedAnnotation && selectedAnnotation >= 0) {
                onSelectAnnotation(undefined);
            } else {
                setDraggingBegin({x: e.evt.layerX, y: e.evt.layerY});
                setDraggingCurrent({x: e.evt.layerX, y: e.evt.layerY});
            }
        }
    }

    const onMouseUp = (e: any) => {
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
        const clickedOnEmpty = (e.target === e.target.getStage() || e.target.image);
        if (clickedOnEmpty) {
            onSelectAnnotation(undefined);
        }
    };


    return <ImageFrame>
        <Stage
            {...frameSize}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
        >
            <Layer>
                <Image
                    image={image.element}
                    {...applyTransformation(frameTransform, {x: 0, y: 0, ...image})}
                />
                {
                    annotations.map((rect, i) => {
                        const key = JSON.stringify(rect);
                        return <Annotation
                            key={key}
                            color={ rect.color || '#00000ff' }
                            shapeProps={applyTransformation(frameTransform, rect)}
                            isSelected={i === selectedAnnotation}
                            onSelect={() => {
                                onSelectAnnotation(i);
                            }}
                            onChange={(newAttrs: any) => {
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

const Annotation = (props: {
    shapeProps: any,
    color: string
    isSelected: any,
    onSelect: any,
    onChange: any,
}) => {
    const {shapeProps, color, isSelected, onSelect, onChange} = props;
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
                fill={color}
                opacity={0.5}
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


function rectangleFromTwoPoint(p1: Point, p2: Point): Rectangle {
    const left = Math.min(p1.x, p2.x);
    const right = Math.max(p1.x, p2.x);
    const top = Math.min(p1.y, p2.y);
    const bottom = Math.max(p1.y, p2.y);
    return {
        x: left, y: top, width: right - left, height: bottom - top
    }
}
