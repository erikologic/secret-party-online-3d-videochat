import { createCanvas } from "canvas";
// @ts-ignore
import { hsv } from "color-space";

// @ts-ignore
import * as wrtc from "wrtc";
const { RTCVideoSource, rgbaToI420 } = wrtc.nonstandard;

const width = 640;
const height = 480;

interface IGetVideoStreamResult {
    stream: MediaStream;
    stopStream: () => void;
}

export function getStream(): IGetVideoStreamResult {
    const source = new RTCVideoSource();
    const track = source.createTrack();
    const stream = new wrtc.MediaStream();

    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    let hue = 0;

    const interval = setInterval(() => {
        hue = ++hue % 360;
        const [r, g, b] = hsv.rgb([hue, 100, 100]);

        context.font = "60px Sans-serif";
        context.strokeStyle = "black";
        context.lineWidth = 1;
        context.fillStyle = `rgba(${Math.round(r)}, ${Math.round(
            g
        )}, ${Math.round(b)}, 1)`;
        context.textAlign = "center";
        context.save();
        context.translate(width / 2, height / 2);
        context.strokeText("node-webrtc", 0, 0);
        context.fillText("node-webrtc", 0, 0);
        context.restore();

        const rgbaFrame = context.getImageData(0, 0, width, height);
        const i420Frame = {
            width,
            height,
            data: new Uint8ClampedArray(1.5 * width * height),
        };
        rgbaToI420(rgbaFrame, i420Frame);
        source.onFrame(i420Frame);
    });

    const stopStream = () => {
        clearInterval(interval);
        track.stop();
    };

    stream.addTrack(track);

    return { stream, stopStream };
}
