export interface Point {
    readonly x: number;
    readonly y: number;
}

export interface Size {
    readonly width: number;
    readonly height: number;
}

export interface Rectangle extends Size, Point {

}


export const DEFAULT_EMPTY_RECT: Rectangle = {
    x: 0, y: 0, height: 0, width: 0,
}


export interface Transformation {
    readonly offset: Point,
    readonly scale: number
}

export function transformationFittingToFrame(frame: Size, subject: Size): Transformation {
    let scale = frame.width / subject.width;
    const outputSubjectHeight = subject.height * scale;
    if (outputSubjectHeight <= frame.height) {
        // try fitting horizontally first
        const paddingHeight = frame.height - outputSubjectHeight;
        return {
            offset: {x: 0, y: paddingHeight / 2},
            scale: scale
        }
    }

    // Rescale to fit vertically
    scale = frame.height / subject.height;
    const paddingWidth = frame.width - subject.width * scale
    return {
        offset: {x: paddingWidth / 2, y: 0},
        scale: scale
    }
}


export function applyTransformation(transformation: Transformation, rectangle: Rectangle) {
    const {x, y, width, height} = rectangle;
    const {scale, offset} = transformation;
    return {
        ...rectangle,
        x: scale * x + offset.x,
        y: scale * y + offset.y,
        width: scale * width,
        height: scale * height
    }
}

export function revertTransformation(transformation: Transformation, rectangle: Rectangle, clipToInteger: boolean = true) {
    const {x, y, width, height} = rectangle;
    const {scale, offset} = transformation;
    const result = {
        x: (x - offset.x) / scale,
        y: (y - offset.y) / scale,
        width: width / scale,
        height: height / scale
    }

    return !clipToInteger ? result : {
        ...rectangle,
        x: Math.round(result.x),
        y: Math.round(result.y),
        width: Math.round(result.width),
        height: Math.round(result.height),
    }
}