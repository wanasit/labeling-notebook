import React, {createRef, useEffect, useState} from "react";
import styled from "styled-components";

const MIN_WIDTH = 75;

interface SplitViewProps {
    left: React.ReactElement;
    right: React.ReactElement;
    className?: string;
    initialLeftWidth?: number;
}

const LeftPane: React.FunctionComponent<{
    leftWidth: number | undefined;
    setLeftWidth: (value: number) => void;
}> = ({children, leftWidth, setLeftWidth}) => {
    const leftRef = createRef<HTMLDivElement>();

    useEffect(() => {
        if (leftRef.current) {
            if (!leftWidth) {
                setLeftWidth(leftRef.current.clientWidth);
                return;
            }

            leftRef.current.style.width = `${leftWidth}px`;
        }
    }, [leftRef, leftWidth, setLeftWidth]);

    return <LeftPaneDiv ref={leftRef}>{children}</LeftPaneDiv>;
};

export const SplitView: React.FunctionComponent<SplitViewProps> = (
    {
        left,
        right,
        className,
        initialLeftWidth = 350
    }) => {
    const [leftWidth, setLeftWidth] = useState<undefined | number>(initialLeftWidth);
    const [separatorXPosition, setSeparatorXPosition] = useState<undefined | number>(undefined);
    const [dragging, setDragging] = useState(false);

    const splitPaneRef = createRef<HTMLDivElement>();

    const onMouseDown = (e: React.MouseEvent) => {
        setSeparatorXPosition(e.clientX);
        setDragging(true);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setSeparatorXPosition(e.touches[0].clientX);
        setDragging(true);
    };

    const onMove = (clientX: number) => {
        if (dragging && leftWidth && separatorXPosition) {
            const newLeftWidth = leftWidth + clientX - separatorXPosition;
            setSeparatorXPosition(clientX);

            if (newLeftWidth < MIN_WIDTH) {
                setLeftWidth(MIN_WIDTH);
                return;
            }

            if (splitPaneRef.current) {
                const splitPaneWidth = splitPaneRef.current.clientWidth;

                if (newLeftWidth > splitPaneWidth - MIN_WIDTH) {
                    setLeftWidth(splitPaneWidth - MIN_WIDTH);
                    return;
                }
            }

            setLeftWidth(newLeftWidth);
        }
    };

    const onMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        onMove(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
        onMove(e.touches[0].clientX);
    };

    const onMouseUp = () => {
        setDragging(false);
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

    return (
        <SplitViewDiv className={`${className ?? ""}`} ref={splitPaneRef}>
            <LeftPane leftWidth={leftWidth} setLeftWidth={setLeftWidth}>
                {left}
            </LeftPane>
            <DividerHitbox
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                onTouchEnd={onMouseUp}
            >
                <Divider/>
            </DividerHitbox>
            <RightPane>{right}</RightPane>
        </SplitViewDiv>
    );
};

const DividerHitbox = styled.div`
  cursor: col-resize;
  align-self: stretch;
  display: flex;
  align-items: center;
  padding: 0 2px;
`

const Divider = styled.div`
  height: 100%;
  border: 1px solid #eee;
`

const LeftPaneDiv = styled.div`
  overflow: hidden;
  height: 100%;
`
const RightPane = styled.div`
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
