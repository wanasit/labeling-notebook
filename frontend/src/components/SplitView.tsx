import React, {createRef, useEffect, useLayoutEffect, useState} from "react";
import styled from "styled-components";
import {Size} from "../utils/shapes";

const MIN_WIDTH = 75;


export interface SplitViewComponentsSize {
    left: Size,
    right: Size,
    center: Size
}

export interface SplitViewProps {
    leftPane?: React.ReactElement | null;
    rightPane?: React.ReactElement | null;
    className?: string;
    initialLeftWidth?: number;
    componentsSize: SplitViewComponentsSize,
    onComponentsResize?: (size: SplitViewComponentsSize) => void;
}


export const SplitView: React.FunctionComponent<SplitViewProps> = (
    {
        leftPane,
        rightPane,
        className,
        componentsSize,
        onComponentsResize,
        children,
    }) => {
    const splitPaneRef = createRef<HTMLDivElement>();
    const [dragging, setDragging] = useState<null | DraggingState>(null);

    const leftWidth = componentsSize.left.width;
    const rightWidth = componentsSize.right.width;

    const onMove = (clientX: number) => {
        if (!dragging || !splitPaneRef.current) {
            return;
        }

        let newLeftWidth = leftWidth;
        let newRightWidth = rightWidth;
        if (dragging.resizingTarget == 'leftPane') {
            newLeftWidth = leftWidth + clientX - dragging.xPosition;
        }

        if (dragging.resizingTarget == 'rightPane') {
            newRightWidth = rightWidth - clientX + dragging.xPosition;
        }

        setSideViewsSize(newLeftWidth, newRightWidth);
        setDragging({...dragging, xPosition: clientX});
    };

    const setSideViewsSize = (newLeftWidth: number, newRightWidth: number) => {
        if (!splitPaneRef.current) {
            return;
        }

        let height = splitPaneRef.current.clientHeight;
        let totalWidth = splitPaneRef.current.clientWidth;
        let newCenterWidth = totalWidth - newRightWidth - newLeftWidth;
        if (onComponentsResize) {
            onComponentsResize({
                left: {height, width: newLeftWidth},
                center: {height, width: newCenterWidth},
                right: {height, width: newRightWidth}
            })
        }
    }


    const onMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        onMove(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
        onMove(e.touches[0].clientX);
    };

    const onMouseUp = () => {
        setDragging(null);
    };

    React.useEffect(() => {
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("touchmove", onTouchMove);
        document.addEventListener("mouseup", onMouseUp);

        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("touchmove", onTouchMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
    });

    useLayoutEffect(() => {
        if (splitPaneRef.current) {

            const measure = () => window.requestAnimationFrame(
                () => setSideViewsSize(leftWidth, rightWidth));
            measure();
            window.addEventListener("resize", measure);
            window.addEventListener("scroll", measure);
            return () => {
                window.removeEventListener("resize", measure);
                window.removeEventListener("scroll", measure);
            };
        }
    }, [splitPaneRef]);

    return (
        <SplitViewDiv className={`${className ?? ""}`} ref={splitPaneRef}>
            <SidePane width={leftWidth} setWidth={(newLeftWidth) => setSideViewsSize(newLeftWidth, rightWidth)}>
                {leftPane}
            </SidePane>
            <Divider
                onDraggingStart={xPosition => setDragging({xPosition, resizingTarget: 'leftPane'})}
                onDraggingEnd={() => setDragging(null)}
            />
            <Main>{children}</Main>

            {rightPane && <>
                <Divider
                    onDraggingStart={xPosition => setDragging({xPosition, resizingTarget: 'rightPane'})}
                    onDraggingEnd={() => setDragging(null)}
                />
                <SidePane width={rightWidth} setWidth={(newRightWidth) => setSideViewsSize(leftWidth, newRightWidth)}>
                    {rightPane}
                </SidePane>
            </>
            }


        </SplitViewDiv>
    );
};

interface DraggingState {
    xPosition: number,
    resizingTarget: 'leftPane' | 'rightPane'
}

const Divider: React.FunctionComponent<{
    onDraggingStart: (xPosition: number) => void,
    onDraggingEnd: () => void
}> = ({onDraggingStart, onDraggingEnd}) => {
    return <DividerHitbox
        onMouseDown={(e) => onDraggingStart(e.clientX)}
        onTouchStart={(e) => onDraggingStart(e.touches[0].clientX)}
        onTouchEnd={onDraggingEnd}
    >
        <DividerInner/>
    </DividerHitbox>
}

const SidePane: React.FunctionComponent<{
    width: number | undefined;
    setWidth: (value: number) => void;
}> = ({children, width, setWidth}) => {
    const ref = createRef<HTMLDivElement>();

    useEffect(() => {
        if (ref.current) {
            if (!width) {
                setWidth(ref.current.clientWidth);
                return;
            }

            ref.current.style.width = `${width}px`;
        }
    }, [ref, width, setWidth]);

    return <SidePaneDiv ref={ref}>{children}</SidePaneDiv>;
};

const DividerHitbox = styled.div`
  cursor: col-resize;
  align-self: stretch;
  display: flex;
  align-items: center;
`

const DividerInner = styled.div`
  height: 100%;
  border: 1px solid #ddd;
`

const SidePaneDiv = styled.div`
  overflow: hidden;
  height: 100%;
`
const Main = styled.div`
  flex: 1;
  height: 100%;
  overflow-x: hidden;
`

const SplitViewDiv = styled.div` {
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`
