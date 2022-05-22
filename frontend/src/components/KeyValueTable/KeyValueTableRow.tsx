import React, {useCallback, useEffect, useState} from "react";
import {KeyValuePair} from "./index";
import styled from "styled-components";

export default function KeyValueTableRow(props: {
    dataKey?: string,
    dataValue?: string | number,
    autofocusKey?: boolean,
    autofocusValue?: boolean,
    readonly?: boolean | ((key: string, value: any) => boolean),
    onKeyValueChange?: (newValue?: KeyValuePair, currentValue?: KeyValuePair) => any
}) {
    const {dataKey, dataValue, autofocusKey = false, autofocusValue = false, onKeyValueChange = () => null} = props;
    const [currentKey, setCurrentKey] = useState(dataKey ?? '');
    const [currentValue, setCurrentValue] = useState(dataValue ?? '');

    useEffect(() => {
        setCurrentKey(dataKey ?? '');
    }, [dataKey, setCurrentKey]);

    useEffect(() => {
        setCurrentValue(dataValue ?? '');
    }, [dataValue, setCurrentValue]);


    const onKeyBlur = useCallback((event) => {
        const newKey = event.target.value;

        if (!dataKey && !newKey) {
            return onKeyValueChange(undefined, undefined);
        }

        if (!newKey && newKey !== dataKey) {
            return onKeyValueChange([newKey, dataValue ?? ''], dataKey ? [dataKey, dataValue] : undefined)
        }

    }, [dataKey, onKeyValueChange]);

    const onValueBlur = useCallback((event) => {
        const newValue = event.target.value;
        if (dataKey && newValue !== dataValue) {
            return onKeyValueChange([dataKey, newValue], dataKey ? [dataKey, dataValue] : undefined)
        }

    }, [dataValue, onKeyValueChange]);

    return <tr key={dataKey}>
        <td>
            <input autoFocus={autofocusKey} type="text" name="key" value={currentKey} onChange={e => setCurrentKey(e.target.value)}
                   onBlur={onKeyBlur}/>
        </td>
        <td>
            <input autoFocus={autofocusValue} type="text" name="name" value={currentValue} onChange={e => setCurrentValue(e.target.value)}
                   onBlur={onValueBlur}/>
        </td>
        <td>
            <StyledRemoveButton tabIndex={-1} onClick={e => onKeyValueChange(
                undefined,
                (dataKey !== undefined) ? [dataKey, dataValue] : undefined
            )}/>
        </td>
    </tr>
}

const StyledRemoveButton = styled.button`
    cursor: pointer;
    
    height: 20px;
    width: 20px;
    display: block;
    margin: auto;
    
    border: 1px solid #aaa;
    background-color: #fff;
    
    position: relative;
    &:after {
          content: '';
          position: absolute;
          transform: translate(-50%, -50%);
          height: 1px;
          width: 50%;
          background-color: #aaa;
          top: 50%;
          left: 50%;
    }
    
    &:hover {
        border-color: #e43326;
    }
    
    &:hover:after {
        background: #e43326;
    }
`