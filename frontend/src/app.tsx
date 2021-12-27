import React, {useEffect, useMemo, useState} from 'react';
import ReactDOM from 'react-dom';

import styled from "styled-components";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-keyed-file-browser/dist/react-keyed-file-browser.css';

import ImageBrowser from "./components/ImageBrowser";
import {SplitViewComponentsSize, SplitView} from "./components/SplitView";
import {NumberParam, StringParam, useQueryParam} from "use-query-params";
import ImageDataEditor from "./components/ImageDataEditor";
import {useImage, useImageData} from "./api";
import AnnotatedImage from "./components/AnnotatedImage";

export default function App() {
    const [key, setKey] = useQueryParam('key', StringParam);
    const [selectedAnnotationIdx, setSelectedAnnotationIdx] = useQueryParam('index', NumberParam);

    const [image] = useImage(key);
    const [imageData, setImageData] = useImageData(key);

    const annotations = imageData?.annotations || [];
    const setAnnotations = (annotations: any[]) => {
        annotations.forEach(a => {
            delete a.color;
        })
        setImageData({...imageData, annotations})
    }

    const tags = imageData?.tags || [];
    const setTags = (tags: any) => {
        setImageData({...imageData, tags})
    }

    const [viewComponentsSize, setViewComponentsSize] = useState<SplitViewComponentsSize>({
        left: {width: 350, height: -1},
        right: {width: 450, height: -1},
        center: {width: 100, height: -1}
    })

    const onKeyPress = (e: KeyboardEvent) => {
        if (e.target !== document.body) {
            return;
        }

        if (e.key === 'Escape') {
            setSelectedAnnotationIdx(undefined);
        }

        if (e.key === 'Backspace') {
            if (selectedAnnotationIdx != null) {
                annotations.splice(selectedAnnotationIdx, 1);
                setAnnotations(annotations);
            }

            setSelectedAnnotationIdx(undefined);
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', onKeyPress);
        return () => {
            window.removeEventListener('keydown', onKeyPress);
        };
    })


    return (
        <AppContainer>
            <SplitView
                componentsSize={viewComponentsSize}
                onComponentsResize={(newSize) => {
                    setViewComponentsSize(newSize)
                }}
                leftPane={
                    <SidebarFrame>
                        <ImageBrowser
                            onSelectImage={imagePath => {
                                setKey(imagePath)
                                setSelectedAnnotationIdx(null);
                            }}
                        />
                    </SidebarFrame>
                }
                rightPane={
                    image && <ImageDataEditor
                        imageInfo={
                            {
                                name: key || '',
                                width: image.width,
                                height: image.height
                            }}
                        tags={tags}
                        onChangeTags={setTags}

                        annotations={annotations}
                        selectedAnnotation={selectedAnnotationIdx}
                        onSelectAnnotation={setSelectedAnnotationIdx}
                        onChangeAnnotations={setAnnotations}
                    />
                }
            >
                {image && image.element && <ImageFrame>
                    <AnnotatedImage
                        width={viewComponentsSize.center.width}
                        height={viewComponentsSize.center.height}
                        image={image}
                        annotations={annotations}
                        selectedAnnotation={selectedAnnotationIdx}
                        onSelectAnnotation={setSelectedAnnotationIdx}
                        onChangeAnnotations={setAnnotations}
                    />
                </ImageFrame>}
            </SplitView>

        </AppContainer>
    );
}


const AppContainer = styled.div`
    height: 100vh;
    
    .Resizer {
      background: #000;
      opacity: 0.2;
      z-index: 1;
      -moz-box-sizing: border-box;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      -moz-background-clip: padding;
      -webkit-background-clip: padding;
      background-clip: padding-box;
    }
      
    .Resizer:hover {
      -webkit-transition: all 2s ease;
      transition: all 2s ease;
    }
    
    .Resizer.horizontal {
      height: 11px;
      margin: -5px 0;
      border-top: 5px solid rgba(255, 255, 255, 0);
      border-bottom: 5px solid rgba(255, 255, 255, 0);
      cursor: row-resize;
      width: 100%;
    }
    
    .Resizer.horizontal:hover {
      border-top: 5px solid rgba(0, 0, 0, 0.5);
      border-bottom: 5px solid rgba(0, 0, 0, 0.5);
    }
    
    .Resizer.vertical {
      width: 11px;
      margin: 0 -5px;
      border-left: 5px solid rgba(255, 255, 255, 0);
      border-right: 5px solid rgba(255, 255, 255, 0);
      cursor: col-resize;
    }
    
    .Resizer.vertical:hover {
      border-left: 5px solid rgba(0, 0, 0, 0.5);
      border-right: 5px solid rgba(0, 0, 0, 0.5);
    }
    .Resizer.disabled {
      cursor: not-allowed;
    }
    .Resizer.disabled:hover {
      border-color: transparent;
    }
`;

const AppFrame = styled.div`
    height: 100%;
`;

const ImageFrame = styled.div`
    height: 100%;
`;


const ImageDataFrame = styled.div`
    height: 100%;
`;


const SidebarFrame = styled.div`
    height: 100%;
    overflow: scroll;
    background-color: rgba(17,24,39, 1);
    color: rgba(156,163,175, 1);
    
    .files {
        tbody {
            tr, tr a {
                color: rgba(156,163,175, 1);
            }
            
            tr:hover {
                background-color: rgba(255, 255, 255, 0.05);
            }
            
            tr.selected, tr.selected a {
                rgba(229,231,235,1);
                background-color: rgba(55,65,81,1);
            }
        }
    }
`;


