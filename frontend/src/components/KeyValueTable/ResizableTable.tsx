import React, {Component, useCallback, useEffect, useRef, useState} from "react";
import styled from "styled-components";

/**
 * A three-column grid table.
 * The first two columns are resizable, while the remaining column size is fixed.
 *
 * Ref: https://letsbuildui.dev/articles/resizable-tables-with-react-and-css-grid
 */
export default function ResizableTable(props: {
    headerFirst: React.ReactNode,
    headerSecond: React.ReactNode,
    headerLast: React.ReactNode,
    children: React.ReactNode,
    className?: string
    minCellWidth?: number,
    lastCellWidth?: number
}) {
    const {headerFirst, headerSecond, headerLast, minCellWidth = 100, lastCellWidth = 40} = props;
    const [tableHeight, setTableHeight] = useState("auto");
    const [isResizing, setResizing] = useState<boolean>(false);
    const tableElement = useRef(null);
    const leftColumnHeaderElement = useRef(null);

    useEffect(() => {
        // @ts-ignore
        tableElement.current.style.gridTemplateColumns =
            `minmax(${minCellWidth}, 1fr) minmax(${lastCellWidth}, 1fr) ${lastCellWidth}px`
    }, []);


    useEffect(() => {
        // @ts-ignore
        setTableHeight(tableElement.current.offsetHeight);
    }, [props.children]);

    const mouseMove = useCallback((e) => {
            // @ts-ignore
            const tableRef: HTMLElement = tableElement.current;
            const tableRect = tableRef.getBoundingClientRect();

            const tableWidth = tableRect.width;
            const flexibleWidth = tableWidth - lastCellWidth - 4;

            // @ts-ignore
            const selectedColRef: HTMLElement = leftColumnHeaderElement.current;
            const selectedColRect = selectedColRef.getBoundingClientRect();

            let selectedWidth = e.clientX - selectedColRect.left;
            selectedWidth = Math.max(selectedWidth, minCellWidth);
            selectedWidth = Math.min(selectedWidth, flexibleWidth - minCellWidth);

            // @ts-ignore
            tableElement.current.style.gridTemplateColumns =
                `${selectedWidth}px ${flexibleWidth - selectedWidth}px ${lastCellWidth}px`;
        },
        [isResizing, minCellWidth, lastCellWidth]
    );

    const removeListeners = useCallback(() => {
        window.removeEventListener("mousemove", mouseMove);
        window.removeEventListener("mouseup", removeListeners);
    }, [mouseMove]);

    const mouseUp = useCallback(() => {
        setResizing(false);
        removeListeners();
    }, [setResizing, removeListeners]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", mouseMove);
            window.addEventListener("mouseup", mouseUp);
        }

        return () => {
            removeListeners();
        };
    }, [isResizing, mouseMove, mouseUp, removeListeners]);

    return <StyledResizableTable className="">
        <table ref={tableElement}>
            <thead>
            <tr>
                <th ref={leftColumnHeaderElement}>
                    {headerFirst}
                    <div
                        style={{height: tableHeight}}
                        onMouseDown={() => setResizing(true)}
                        className={`resize-handle ${isResizing ? 'active' : 'idle'}`}
                    />
                </th>
                <th>
                    {headerSecond}
                    <div
                        style={{height: tableHeight}}
                        className={`resize-handle idle`}
                    />
                </th>
                <th>
                    {headerLast}
                </th>
            </tr>
            </thead>
            <tbody>
            {props.children}
            </tbody>
        </table>
    </StyledResizableTable>
}


const StyledResizableTable = styled.div`
    table {
        width: 100%;
        overflow: auto;
        display: grid;
        grid-template-columns:
            minmax(100px, 1fr)
            minmax(100px, 1fr)
            40px;
            
        thead, tbody, tr {
            display: contents;
        }
        
        th, td {
            display: block;
            min-width: 100px;
        }
        
        th:last-child, td:last-child {
            min-width: 0px;
            text-align: center;
        }
        
        th {
            position: relative;
            span {
                display: block;
            }
        }
        
        .resize-handle {
            display: block;
            position: absolute;
            cursor: col-resize;
            width: 7px;
            top: 0;
            right: 0;
            z-index: 1;
            border-right: 2px solid transparent;
            
            &:hover {
                border-color: #aaa;
            }
            
            &.active {
                border-color: #888;
            }
        }
    }
`