import React, {useMemo} from "react";
import styled from "styled-components";

import Creatable from 'react-select/creatable';
import {Annotation, Image, ImageData, usePluginMap} from "../api";
import KeyValueTable from "./KeyValueTable";


export default function ImageDataEditor(props: {
    image?: Image,
    imageData?: ImageData,
    selectedAnnotationIdx?: number,
    onImageDataChange?: (update: ImageData) => any,
    onPluginApply?: (pluginName: string, pluginInfo: any) => any,
}) {
    const {
        image,
        imageData,
        selectedAnnotationIdx,
        onImageDataChange = () => null,
        onPluginApply = () => null,
    } = props;
    const [options, setOptions] = useTagsAsOptions(imageData, onImageDataChange);
    const [selectedAnnotation, updateSelectedAnnotation] = useSelectedAnnotation(
        selectedAnnotationIdx, imageData, onImageDataChange);

    const annotationCount = imageData?.annotations?.length ?? 0;
    const {data} = usePluginMap();
    const plugInData: [string, any][] = data ? Object.entries(data).sort() : [];

    return <ImageDataFrame>
        {image && <HeaderSection>
            <h4>{image.key}</h4>
            <p>{image.width} x {image.height}</p>
            <h5>Tags:</h5>
            <Creatable
                styles={{
                    control: (provided: any, state: any) => ({
                        ...provided,
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

        {selectedAnnotationIdx !== undefined ? <Section>
                <h5>Annotation: {selectedAnnotationIdx + 1} (of {annotationCount})</h5>
                {selectedAnnotation &&
                    <KeyValueTable
                        key={selectedAnnotationIdx}
                        data={selectedAnnotation}
                        readonlyKeys={['x', 'y', 'width', 'height']}
                        onDataChange={(data) => updateSelectedAnnotation(data as Annotation)}
                    />
                }
            </Section> :
            <NoteSection>
                <div>
                    <h5>Annotation</h5>
                    {(annotationCount > 0) && <p>Select an annotation to move or update its key/value.</p>}
                    <p>To create an annotation, hold <span>Ctrl</span> or <span>⌘</span> key and select empty area.</p>
                </div>
                {(plugInData && plugInData.length > 0) && <PluginOptions>
                    <h5>Plug-in</h5>
                    Select the following options to apply plug-in to the image:
                    <ul>
                        {plugInData.map(([name, info]) => <li key={name}>
                            <button onClick={() => onPluginApply(name, info)}>{info['name'] || name}</button>
                            : {info['description']}
                        </li>)}
                    </ul>
                </PluginOptions>}
            </NoteSection>
        }
    </ImageDataFrame>
};

interface TagOption {
    value: string,
    label: string
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


const ImageDataFrame = styled.div`
  position: relative;
  overflow-x: hidden;
  height: 100%;
  width: 100%;
`;

const HeaderSection = styled.div`
  padding: 20px 10px;
  margin-bottom: 30px;

  color: rgba(200, 200, 200, 1);
  background-color: rgba(17, 24, 39, 1);

  h5 {
    margin-top: 20px;
    font-size: 1rem;
  }
`;

const NoteSection = styled.div`
  padding: 10px;
  margin-bottom: 20px;
  color: rgba(100, 100, 100, 1);

  span {
    border: solid 1px;
    padding: 1px 3px;
  }

  > div {
    margin-bottom: 30px;
  }

  > p {
    margin-bottom: 20px;
  }

`;

const PluginOptions = styled.div`
  ul {
    padding-left: 20px;

    li {
      margin: 10px 0;
    }
  }

  button {
    color: rgba(80, 80, 80, 1);
    background: none !important;
    border: none;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
  }
`;

const Section = styled.div`
  padding: 10px;
  margin-bottom: 20px;
  color: rgba(17, 24, 39, 1);

  h5 {
    font-size: 1.2rem;
  }

  .kv-table {
    margin-top: 10px;

    th {
      font-size: 1rem;
    }
  }
`;