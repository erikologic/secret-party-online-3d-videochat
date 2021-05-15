import {Local, RemoteRoom, Room} from "../../src/init";

describe('when entering a room', () => {
    it('gets the local webcam video stream', async () => {
        const remoteRoom: RemoteRoom = {
            join: jest.fn().mockResolvedValue(undefined)
        };

        const local: Local = {
            getWebcamStream: jest.fn().mockResolvedValue(undefined)
        };

        const room = new Room(local, remoteRoom);
        await room.join('aRoom');
        
        expect(local.getWebcamStream).toHaveBeenCalled();
    });
    
    it('join remote room', async() => {
        const remoteRoom: RemoteRoom = {
            join: jest.fn().mockResolvedValue(undefined)
        };
        
        const local: Local = {
            getWebcamStream: jest.fn().mockResolvedValue(undefined)
        };

        const room = new Room(local, remoteRoom);
        await room.join('aRoom');
        
        expect(remoteRoom.join).toHaveBeenCalled()
    })
})