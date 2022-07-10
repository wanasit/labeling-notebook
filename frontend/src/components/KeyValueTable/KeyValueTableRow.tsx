import React, {useCallback, useEffect, useState} from "react";
import {KeyValuePair} from "./index";
import styled from "styled-components";

export default function KeyValueTableRow(props: {
    dataKey?: string,
    dataValue?: string | number,
    readonly?: boolean,
    autofocusKey?: boolean,
    autofocusValue?: boolean,
    onKeyValueChange?: (newValue?: KeyValuePair, currentValue?: KeyValuePair) => any
}) {
    const {dataKey, dataValue, readonly = false, autofocusKey = false, autofocusValue = false, onKeyValueChange = () => null} = props;
    const [currentKey, setCurrentKey] = useState(dataKey ?? '');
    const [currentValue, setCurrentValue] = useState(dataValue ?? '');

    useEffect(() => {
        setCurrentKey(dataKey ?? '');
    }, [dataKey, setCurrentKey]);

    useEffect(() => {
        setCurrentValue(dataValue ?? '');
    }, [dataValue, setCurrentValue]);


    const onKeyBlur = useCallback((event) => {
        let newKey = event.target.value || '';
        newKey = newKey.trim();
        if (newKey && newKey !== dataKey) {
            return onKeyValueChange([newKey, dataValue ?? ''], dataKey ? [dataKey, dataValue] : undefined);
        }
    }, [dataKey, dataValue, onKeyValueChange]);

    const onValueBlur = useCallback((event) => {
        const newValue = event.target.value;
        if (dataKey && newValue !== dataValue) {
            return onKeyValueChange([dataKey, newValue], [dataKey, dataValue]);
        }

    }, [dataKey, dataValue, onKeyValueChange]);

    return <tr key={dataKey}>
        <td>
            <input autoFocus={autofocusKey} type="text" name="key" disabled={readonly} value={currentKey} onChange={e => setCurrentKey(e.target.value)}
                   onBlur={onKeyBlur}/>
        </td>
        <td>
            <input autoFocus={autofocusValue} type="text" name="name" disabled={readonly} value={currentValue} onChange={e => setCurrentValue(e.target.value)}
                   onBlur={onValueBlur}/>
        </td>
        <td>
            {!readonly && <StyledRemoveButton tabIndex={-1} onClick={e => onKeyValueChange(
                undefined,
                (dataKey !== undefined) ? [dataKey, dataValue] : undefined
            )}/>}
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