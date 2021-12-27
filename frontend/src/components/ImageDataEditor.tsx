import React, {useMemo, useState} from "react";
import styled from "styled-components";
import Collapsible from "react-collapsible";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
import {Rectangle} from "../utils/shapes";

import Creatable from 'react-select/creatable';
import {Button} from "react-bootstrap";
import {Annotation, DEFAULT_ANNOTATION_COLOR, DEFAULT_ANNOTATION_SELECTED_COLOR} from "../api";

export interface ImageInfo {
    name: string
    width: number,
    height: number,
}

export default function ImageDataEditor(props: {

    imageInfo?: ImageInfo,

    tags: string[],
    onChangeTags?: (tags: string[]) => void,

    annotations: Annotation[],
    selectedAnnotation?: number | null,
    onSelectAnnotation?: (index?: number) => void
    onChangeAnnotations?: (annotations: Annotation[]) => void,
}) {

    const {
        imageInfo,
        tags,
        annotations,
        selectedAnnotation,
        onSelectAnnotation,
        onChangeTags,
        onChangeAnnotations
    } = props;

    const [options, setOptions] = useTagsAsOptions(tags, onChangeTags);
    const [annotationContents, setAnnotationContent, resetAnnotationContent, saveAnnotationContent] =
        useAnnotationContents(annotations, onChangeAnnotations);

    const clearAnnotationSelection = (i: number) => {
        if (onSelectAnnotation && selectedAnnotation === i) {
            onSelectAnnotation(undefined)
        }
    }
    const setAnnotationSelection = (i: number) => {
        if (onSelectAnnotation) {
            onSelectAnnotation(i)
        }
    }

    return <ImageDataFrame>

        {imageInfo && <HeaderSection>
            <h4>{imageInfo.name}</h4>
            <p>{imageInfo.width} x {imageInfo.height}</p>
        </HeaderSection>
        }

        <Section>
            <h5>Tags:</h5>
            <Creatable
                isMulti={true}
                value={options}
                onChange={(x) => setOptions(x)}
                formatCreateLabel={(newLabel) => `Add tag "${newLabel}"`}
            />
        </Section>

        <Section>
            <h5>Annotations:</h5>
            {
                annotations.map((annotation, i) => {

                    const selected = selectedAnnotation === i;
                    const color = annotation.color || (selected ? DEFAULT_ANNOTATION_SELECTED_COLOR : DEFAULT_ANNOTATION_COLOR)
                    const label = annotation.label || `at (x=${annotation.x}, y=${annotation.y})`
                    return <Collapsible
                        key={i}
                        trigger={
                            <div>
                                <AnnotationColorCode style={{backgroundColor: color}}/>
                                <span>Annotation: <i>{label}</i></span>
                            </div>
                        }
                        transitionTime={100}
                        openedClassName={'open'}
                        open={selectedAnnotation === i}
                        onOpening={() => setAnnotationSelection(i)}
                        onClosing={() => {
                            clearAnnotationSelection(i);
                            resetAnnotationContent(i);
                        }}
                    >
                        {
                            annotationContents[i] && <>
                                <AceEditor
                                    value={annotationContents[i]}
                                    mode="json"
                                    theme="github"
                                    width="100%"
                                    height={`${annotationContents[i].split('\n').length * 20}px`}
                                    onChange={(value) => setAnnotationContent(i, value)}
                                    cursorStart={annotationContents[i].length - 1}
                                />
                                <Button size="sm" variant="primary" disabled={!isJsonString(annotationContents[i])} onClick={() => {
                                    clearAnnotationSelection(i);
                                    saveAnnotationContent(i);
                                }}>Save</Button>
                            </>
                        }


                    </Collapsible>
                })
            }
        </Section>
    </ImageDataFrame>
};

interface TagOption {
    value: string,
    label: string
}

function useTagsAsOptions(tags: string[], onChangeTags?: (tags: string[]) => void):
    [TagOption[], (options: readonly TagOption[]) => void] {

    const options = tags.map((tag) => ({value: tag, label: tag}));
    const setOptions = (options: readonly TagOption[]) => {
        if (onChangeTags) {
            const tags = options.map(o => o.value);
            onChangeTags(tags);
        }
    }

    return [options, setOptions]
}

function useAnnotationContents(annotations: Annotation[], onChangeAnnotations?: (annotations: Annotation[]) => void):
    [string[], (i: number, newContent: string) => void, (i: number) => void, (i: number) => void] {

    const annotationOriginalContents: string[] = useMemo(() => annotations.map(annotation => {
        const annotationContent = {...annotation};
        const rectInfo = `{\n  "x":${annotation['x']}, "y":${annotation['y']}, "width":${annotation['width']}, "height":${annotation['height']},\n`
        delete annotationContent['x'];
        delete annotationContent['y'];
        delete annotationContent['width'];
        delete annotationContent['height'];

        return JSON.stringify(annotationContent, null, 2).replace("{", rectInfo).replace("\n\n", "\n");
    }), [annotations]);

    const [annotationContents, setAnnotationContents] = useState(annotationOriginalContents);
    React.useEffect(() => {
        setAnnotationContents(annotationOriginalContents);
    }, [annotationOriginalContents])

    const setContent = (i: number, newContent: string) => {
        annotationContents[i] = newContent;
        setAnnotationContents(annotationContents);
    }

    const resetContent = (i: number) => {
        annotationContents[i] = annotationOriginalContents[i];
        setAnnotationContents(annotationContents);
    }

    const saveContent = (i: number) => {
        const newAnnotation = JSON.parse(annotationContents[i]);
        if (newAnnotation && onChangeAnnotations) {
            const newAnnotations = annotations.slice();
            newAnnotations[i] = newAnnotation;
            onChangeAnnotations(newAnnotations);
        }
    }

    return [annotationContents, setContent, resetContent, saveContent];
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
`;

const Section = styled.div`
    padding: 10px;
    margin-bottom: 20px;
    color: rgba(17,24,39, 1);
`;

const AnnotationColorCode = styled.span`
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 5px;
    top: 3px;
    position: relative;
`;