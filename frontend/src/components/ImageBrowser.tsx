import React from "react";
import FileBrowser from "react-keyed-file-browser";
import {useFileList} from "../api";
import {generatePath, useHistory, useRouteMatch} from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css';
import {BsFolder2, BsFolder2Open, BsImage} from "react-icons/bs";
import styled from "styled-components";

const Wrapper = styled.div`
    padding: 0;
    overflow-y: scroll;
    
    div.rendered-react-keyed-file-browser {
        .action-bar { 
            display: none;
        }
    
        .files {
            .name svg {
                margin-right: 0.3em;
                margin-top:-0.2em;
            }
            
            
            table tr td:last-child,
            table tr th:last-child {
                display: none;
            }
            
            table tr:not(:last-child) td,
            table tr {
                border: none;
                td { border: none; }
                th { border: none; }
            }
        }
    }
`;


export default function ImageBrowser(props: {
    onSelectImage?: (imagePath: string) => void,
}) {

    const {data} = useFileList();
    const files = data ? data : [];
    return <Wrapper>
        <FileBrowser
            files={files}
            filterRenderer={() => <div/>}
            detailRenderer={() => <div/>}
            icons={{
                Image: <BsImage/>,
                Folder: <BsFolder2/>,
                FolderOpen: <BsFolder2Open/>,
            }}
            onSelect={fileOrFolder => {
                console.log(fileOrFolder);
                if (fileOrFolder) {
                    return props.onSelectImage ? props.onSelectImage(fileOrFolder.key) : null;
                }
            }}
        />
    </Wrapper>
};


