import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import styled from "styled-components";
import ResizableTable from "./ResizableTable";
import KeyValueTableRow from "./KeyValueTableRow";


export type KeyValuePair = [string, any];
export type DataObject = { [key: string]: any }

export default function KeyValueTable(props: {
    data?: DataObject,
    readonly?: boolean | ((key: string, value: any) => boolean),
    onDataChange?: (newData: DataObject) => boolean
}) {
    const {data, onDataChange = () => null} = props;
    const [isAddingValue, setAddingValue] = useState(false);
    const [lastUpdatedKey, setLastUpdatedKey] = useState<string|null>(null);

    const onKeyValueUpdate = useCallback((newValue?: KeyValuePair, currentValue?: KeyValuePair) => {
        const newData = {...data};
        console.log([newValue, currentValue])
        if (currentValue) {
            const [key, _] = currentValue;
            delete newData[key];
        }

        if (newValue) {
            const [key, value] = newValue;
            newData[key] = value;
            setLastUpdatedKey(key);
        }

        setAddingValue(false);
        onDataChange(newData);
    }, [data, onDataChange, setAddingValue, setLastUpdatedKey]);


    const kvPair = useMemo(() =>{
        return Object.entries(data || {}).sort();
    }, [data]) ;

    return <StyledKeyValueTable className='kv-table'>
        <ResizableTable
            headerFirst={<span>Key</span>}
            headerSecond={<span>Value</span>}
            headerLast={
                <StyledAddButton
                    disabled={isAddingValue}
                    onClick={(e) => setAddingValue(true)}/>}
        >
            {isAddingValue && <KeyValueTableRow autofocusKey={true} dataKey={undefined} dataValue={undefined} onKeyValueChange={onKeyValueUpdate}/>}
            {kvPair.map(([key, value], i) => {
                return <KeyValueTableRow
                    autofocusValue={key === lastUpdatedKey}
                    dataKey={key}
                    dataValue={value}
                    onKeyValueChange={onKeyValueUpdate}/>
            })
            }
        </ResizableTable>
    </StyledKeyValueTable>
}




const StyledKeyValueTable = styled.div`
    
    table {
    
        border: 2px solid #aaa;
    
        th { 
            padding: 10px 4px; 
            background-color: #ddd;
            text-align: center;
        }
        
        td {
            padding: 10px 3px;
            border-top: 1px solid #ccc;
        }
        
        input {
            border: 1px solid rgba(0, 0, 0, 0);
            width: 100%;
        }
        
        .resize-handle {
            border-right: 1px solid #ccc;
        }
       
    }
`;



const StyledAddButton = styled.button`
    cursor: pointer;
    height: 20px;
    width: 20px;
    display: block;
    margin: auto;
    
    border: 1px solid #bbb;
    background-color: #eee;
    position: relative;
    

    &:after,
    &:before {
          content: '';
          position: absolute;
          transform: translate(-50%, -50%);
          background-color: #aaa;
          top: 50%;
          left: 50%;
    }
    
    &:after {
       height: 1px;
       width: 50%;
    }
    
    &:before {
       width: 1px;
       height: 50%;
    }
    
    &:hover {
        border-color: #ccc;
        background-color: #aaa;
        
        &:before, &:after {
           background: #ccc;
        }
    }
    
    &:disabled {
        cursor: default;
        background-color: #ccc;
        border-color: #bbb;
        
        &:hover {
            background-color: #ccc;
            border-color: #bbb;
            &:before, &:after {
               background-color: #aaa;
            }
        }
    }
`

