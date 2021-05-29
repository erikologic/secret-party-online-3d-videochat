import { MyPosition, PeerConfig } from "../../../domain/types";

export enum Command {
    Position = "Position",
    Configuration = "Configuration",
}

export const CommandToByte: Record<Command, number> = {
    [Command.Position]: 0,
    [Command.Configuration]: 1,
};

interface MyPositionDeserializedData {
    type: Command.Position;
    payload: MyPosition;
}

interface PeerConfigurationDeserializedData {
    type: Command.Configuration;
    payload: PeerConfig;
}

export type DeserializedData =
    | MyPositionDeserializedData
    | PeerConfigurationDeserializedData;

export enum PositionDataArrayBytePos {
    RotationX,
    RotationY,
    RotationZ,
    RotationW,
    PositionX,
    PositionY,
    PositionZ,
}
