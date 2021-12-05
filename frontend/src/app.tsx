import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import styled from "styled-components";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-keyed-file-browser/dist/react-keyed-file-browser.css';

import Dock from "react-dock";
import ImageBrowser from "./components/ImageBrowser";
import ImageAnnotator from "./components/ImageAnnotator";
import {SplitViewComponentsSize, SplitView} from "./components/SplitView";
import {BrowserRouter, generatePath, useHistory, useParams, useRouteMatch} from "react-router-dom";
import {StringParam, useQueryParam} from "use-query-params";
import ImageDataEditor from "./components/ImageDataEditor";


export default function App() {
    const [src, setSrc] = useQueryParam('src', StringParam);
    const [annotations, setAnnotations] = useState([
        {x: 15, y: 50, width: 200, height: 30},
        {x: 15, y: 250, width: 200, height: 30, text: "abcdefg"},
    ])

    const [viewComponentsSize, setViewComponentsSize] = useState<SplitViewComponentsSize>({
        left: {width: 350, height: -1},
        right: {width: 350, height: -1},
        center: {width: -1, height: -1}
    })

    return (
        <AppContainer>
            <SplitView
                componentsSize={viewComponentsSize}
                onComponentsResize={(newSize) => setViewComponentsSize(newSize)}
                leftPane={
                    <SidebarFrame>
                        <ImageBrowser
                            onSelectImage={imagePath => setSrc(imagePath)}
                        />
                    </SidebarFrame>
                }
                rightPane={
                    <ImageDataEditor
                        annotations={annotations}
                        onChangeAnnotations={setAnnotations}
                    />
                }
            >
                <ImageFrame>
                    <ImageAnnotator
                        src={src ? toImageUrl(src) : ''}
                        annotations={annotations}
                        onChangeAnnotations={setAnnotations}
                    />
                </ImageFrame>
            </SplitView>

        </AppContainer>
    );
}

function toImageUrl(src: string): string {
    return '/api/files/image/' + src;
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


