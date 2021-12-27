import React from "react";
import {Rect, Transformer} from "react-konva";
import {Rectangle} from "../../utils/shapes";

export default function ComponentAnnotation(props: {
    rect: Rectangle,
    color: string
    isSelected: boolean,
    onSelect?: () => void,
    onRectChange?: (newRect: Rectangle) => void,
}) {
    const {
        rect, color, isSelected,
        onSelect = () => null,
        onRectChange = () => null
    } = props;
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
                {...rect}
                draggable={isSelected}
                onDragEnd={(e) => {
                    onRectChange({
                        ...rect,
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
                    onRectChange({
                        ...rect,
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
