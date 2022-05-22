import React, {useMemo} from "react";
import styled from "styled-components";

import Creatable from 'react-select/creatable';
import {Annotation, Image, ImageData} from "../api";
import KeyValueTable from "./KeyValueTable";


export default function ImageDataEditor(props: {
    image?: Image,
    imageData?: ImageData,
    selectedAnnotationIdx?: number,
    onImageDataChange?: (update: ImageData) => any,
}) {
    const {
        image,
        imageData,
        selectedAnnotationIdx,
        onImageDataChange = () => null,
    } = props;

    const [options, setOptions] = useTagsAsOptions(imageData, onImageDataChange);
    const [selectedAnnotation, updateSelectedAnnotation] = useSelectedAnnotation(
        selectedAnnotationIdx, imageData, onImageDataChange);

    return <ImageDataFrame>
        {image && <HeaderSection>
            <h4>{image.key}</h4>
            <p>{image.width} x {image.height}</p>
            <h5>Tags:</h5>
            <Creatable
                styles = {{
                    control: (provided: any, state: any) => ({...provided,
                        backgroundColor: '#eee',
                        border: 'solid 1px #aaa !important',
                        boxShadow: 'none !important'
                    })
                }}
                isMulti={true}
                value={options}
                onChange={(x) => setOptions(x)}
                formatCreateLabel={(newLabel) => `Add tag "${newLabel}"`}
            />
        </HeaderSection>
        }

        { selectedAnnotationIdx !== undefined && <Section>
            <h5>Annotation: {selectedAnnotationIdx + 1} (of {imageData?.annotations?.length})</h5>
            {selectedAnnotation &&
                <KeyValueTable
                    key={selectedAnnotationIdx}
                    data={selectedAnnotation}
                    readonlyKeys={['x', 'y', 'width', 'height']}
                    onDataChange={(data) => updateSelectedAnnotation(data as Annotation) }
                />
            }
        </Section> }
    </ImageDataFrame>
};

interface TagOption {
    value: string,
    label: string
}

interface AnnotationContent {
    value: string,
    isJson: boolean,
}

function useTagsAsOptions(imageData?: ImageData | null, onImageDataChange?: (update: ImageData) => any):
    [TagOption[], (options: readonly TagOption[]) => void] {
    const tags = imageData?.tags || [];
    const options = useMemo(() => tags.map((tag) => ({value: tag, label: tag})), [tags]);
    const setOptions = (options: readonly TagOption[]) => {
        if (onImageDataChange) {
            const tags = options.map(o => o.value);
            onImageDataChange({tags: tags});
        }
    }

    return [options, setOptions]
}


function useSelectedAnnotation(
    selectedAnnotationIdx?: number,
    imageData?: ImageData,
    onImageDataChange?: (update: ImageData) => any
): [Annotation | undefined, (newAnnotation: Annotation) => boolean] {

    if (selectedAnnotationIdx === undefined || imageData === undefined) {
        return [undefined, () => true];
    }

    const annotations = imageData?.annotations || [];
    const selectedAnnotation = annotations[selectedAnnotationIdx];
    const updateSelectedAnnotation = (newAnnotation: Annotation) => {
        if (onImageDataChange) {
            const newAnnotations = annotations.slice();
            newAnnotations[selectedAnnotationIdx] = newAnnotation;
            onImageDataChange({annotations: newAnnotations});
        }

        return true;
    }

    return [selectedAnnotation, updateSelectedAnnotation]
}

function isJsonString(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

const ImageDataFrame = styled.div`
    position: relative;
    overflow-x: hidden;
    height: 100%;
    width: 100%;
    
    .Collapsible {
    
        padding: 0px;
        
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
            padding: 8px 8px;
        }
        
        >div {
            padding: 0px 8px;
        }
        
        button {
            float: right;
            margin: 8px 0px;
        }
    }
`;

const HeaderSection = styled.div`
    padding: 20px 10px;
    margin-bottom: 30px;
    
    color: rgba(200,200,200, 1);
    background-color: rgba(17,24,39, 1);
    
    h5 {
        margin-top: 20px;
        font-size: 1rem;
    }
`;

const Section = styled.div`
    padding: 10px;
    margin-bottom: 20px;
    color: rgba(17,24,39, 1);
    
    h5 {
        font-size: 1rem;
    }
    
    .kv-table {
        margin-top: 10px;
        
        th { 
            font-size: 1rem;
        }
    }
`;