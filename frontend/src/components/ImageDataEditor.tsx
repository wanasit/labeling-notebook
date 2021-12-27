import React, {useMemo, useState} from "react";
import styled from "styled-components";
import Collapsible from "react-collapsible";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";

import Creatable from 'react-select/creatable';
import {Button} from "react-bootstrap";
import {Annotation, DEFAULT_ANNOTATION_COLOR, DEFAULT_ANNOTATION_SELECTED_COLOR, Image} from "../api";


export default function ImageDataEditor(props: {

    image?: Image,

    tags: string[],
    onChangeTags?: (tags: string[]) => void,

    annotations: Annotation[],
    selectedAnnotation?: number | null,
    onSelectAnnotation?: (index?: number) => void
    onChangeAnnotations?: (annotations: Annotation[]) => void,
}) {

    const {
        image,
        tags,
        annotations,
        selectedAnnotation,
        onSelectAnnotation = () => null,
        onChangeTags = () => null,
        onChangeAnnotations = () => null
    } = props;

    const [options, setOptions] = useTagsAsOptions(tags, onChangeTags);
    const [annotationContents, setAnnotationContent, resetAnnotationContent, saveAnnotationContent] =
        useAnnotationContents(annotations, onChangeAnnotations);

    const clearAnnotationSelection = (i: number) => onSelectAnnotation(undefined);
    const setAnnotationSelection = (i: number) => onSelectAnnotation(i);

    return <ImageDataFrame>

        {image && <HeaderSection>
            <h4>{image.key}</h4>
            <p>{image.width} x {image.height}</p>
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
                                    value={annotationContents[i].value}
                                    mode="json"
                                    theme="github"
                                    width="100%"
                                    height={`${annotationContents[i].value.split('\n').length * 20}px`}
                                    onChange={(value) => setAnnotationContent(i, value)}
                                />
                                <Button size="sm" variant="primary"
                                        disabled={!annotationContents[i].isJson}
                                        onClick={() => {
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

interface AnnotationContent {
    value: string,
    isJson: boolean,
}

function useTagsAsOptions(tags: string[], onChangeTags?: (tags: string[]) => void):
    [TagOption[], (options: readonly TagOption[]) => void] {

    const options = useMemo(() => tags.map((tag) => ({value: tag, label: tag})), [tags]) ;
    const setOptions = (options: readonly TagOption[]) => {
        if (onChangeTags) {
            const tags = options.map(o => o.value);
            onChangeTags(tags);
        }
    }

    return [options, setOptions]
}

function useAnnotationContents(annotations: Annotation[], onChangeAnnotations: (annotations: Annotation[]) => void):
    [AnnotationContent[], (i: number, newContent: string) => void, (i: number) => void, (i: number) => void] {

    const annotationOriginalContents: AnnotationContent[] = useMemo(() => annotations.map(annotation => {
        const annotationContent = {...annotation};
        const rectInfo = `{\n  "x":${annotation['x']}, "y":${annotation['y']}, "width":${annotation['width']}, "height":${annotation['height']},\n`
        delete annotationContent['x'];
        delete annotationContent['y'];
        delete annotationContent['width'];
        delete annotationContent['height'];

        const value = JSON.stringify(annotationContent, null, 2)
                .replace("{", rectInfo)
                .replace("\n\n", "\n");
        return {
            value: value,
            isJson: true
        };
    }), [annotations]);

    const [annotationContents, setAnnotationContents] = useState(annotationOriginalContents);
    React.useEffect(() => {
        setAnnotationContents(annotationOriginalContents);
    }, [annotationOriginalContents])

    const setContent = (i: number, newContent: string) => {
        annotationContents[i].value = newContent;
        annotationContents[i].isJson = isJsonString(newContent);
        setAnnotationContents(annotationContents);
    }

    const resetContent = (i: number) => {
        annotationContents[i] = annotationOriginalContents[i];
        setAnnotationContents(annotationContents);
    }

    const saveContent = (i: number) => {
        const newAnnotation = JSON.parse(annotationContents[i].value);
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