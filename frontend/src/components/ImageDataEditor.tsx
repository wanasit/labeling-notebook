import React from "react";
import styled from "styled-components";
import Collapsible from "react-collapsible";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";

export default function ImageDataEditor(props: {
    annotations: any[],
    onChangeAnnotations?: (annotations: any[]) => void,
}) {

    const {annotations, onChangeAnnotations} = props;

    function onChange(i: number, newValue: any) {

        try {
            const newAnnotation = JSON.parse(newValue);
            if (newAnnotation && onChangeAnnotations) {
                const newAnnotations = annotations.slice();
                newAnnotations[i] = newAnnotation;
                console.log(annotations)

                onChangeAnnotations(newAnnotations);
            }
        } catch (e) {}
    }


    return <ImageDataFrame>

        <h4>Image Info <a>(Save)</a></h4>
        <p></p>


        <h5>Annotations:</h5>
        {
            annotations.map((annotation, i) => {
                const rect = {x: annotation.x, y: annotation.y, w: annotation.width, h: annotation.h};
                const jsonString = JSON.stringify(annotation, null, 2)
                const height = jsonString.split('\n').length * 20;
                return <Collapsible
                    trigger={`${JSON.stringify(rect)}`}
                    transitionTime={100}
                    openedClassName={'open'}
                >
                    <AceEditor
                        value={jsonString}
                        mode="json"
                        theme="github"
                        height={`${height}px`}
                        onChange={(value) => onChange(i, value)}
                    />
                </Collapsible>
            })

        }


    </ImageDataFrame>
};

const ImageDataFrame = styled.div`
    position: relative;
    overflow-x: hidden;
    height: 100%;
    width: 100%;
    
    .Collapsible {
    
        padding: 8px 8px;
        
        &:hover {
            background: #eee;
        }
        
        &.open {
            background: #e8e8e8;
        }
        
        >span {
            width: 100%;
            display: block;
            margin-bottom: 5px;
        }
    }
`;