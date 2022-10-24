import { Browser, expect, Locator, Page, test } from "@playwright/test";
import { MyPosition } from "../src/domain/types";

test.use({
    permissions: ["microphone", "camera"],
    channel: "chrome",
    launchOptions: {
        args: [
            "--use-fake-device-for-media-stream",
            "--use-fake-ui-for-media-stream",
        ],
    },
});

const openNewPage = async (browser: Browser) => {
    const page = await browser.newContext().then((c) => c.newPage());
    await page.goto("https://localhost:9000/remote-room-tester.html");
    return page;
};

async function checkVideoIsStarted(userPage: Page, peerVideoId: string) {
    const peerVideoSrcOb = await userPage
        .locator(peerVideoId)
        .evaluate((n) => (n as HTMLVideoElement).srcObject);
    expect(peerVideoSrcOb).not.toBeNull();
}

const getPeerId = async (peerName: Locator) =>
    peerName.evaluate((n) => n.id).then((s) => s.replace("name-", ""));

async function checkPeerIsVisible(userPage: Page, peerSettings: PeerSettings) {
    const peerType = peerSettings.name.toLowerCase().includes("tv")
        ? "tv"
        : "peer";

    const peerName = userPage.getByText(peerSettings.name);
    await expect(peerName).toBeVisible();
    const peerId = await getPeerId(peerName);

    await expect(userPage.locator(`#color-${peerId}`)).toHaveText(
        peerSettings.color
    );
    await expect(userPage.locator(`#type-${peerId}`)).toHaveText(peerType);

    const peerVideoId = `#video-${peerId}`;
    await checkVideoIsStarted(userPage, peerVideoId);
}

interface PeerSettings {
    color: string;
    name: string;
}
const setUserSettingsAndLaunch = async (
    peerSettings: PeerSettings,
    page: Page
) => {
    await page.getByText("What's your name?").fill(peerSettings.name);
    await page.getByText("Choose avatar color:").fill(peerSettings.color);
    await page.getByText("Connect").click();
};

const checkPeerPosition = async (
    page: Page,
    name: string,
    position: MyPosition
) => {
    const peerName = page.getByText(name);
    const peerId = await getPeerId(peerName);
    const receivedPosition = await page
        .locator(`#position-${peerId}`)
        .innerHTML();
    await expect(JSON.parse(receivedPosition)).toEqual(position);
};

const r = (top: number) => Math.random() * top;
const newPosition = (): MyPosition => ({
    absoluteRotation: { w: r(3), x: r(3), y: r(3), z: r(3) },
    globalPosition: { x: r(5), y: r(5), z: r(5) },
});

test("app network layer", async ({ browser }) => {
    // when alice connects to the app
    const alicePage = await openNewPage(browser);
    const aliceSettings = {
        name: "alice",
        color: "#000000",
    };
    await setUserSettingsAndLaunch(aliceSettings, alicePage);
    // then alice configuration loads
    await expect(alicePage.getByText("Type")).toHaveValue("peer");
    // and alice 3d world start
    await expect(alicePage.getByText("Virtual World")).toHaveValue("Started");
    // and alice webcam is shown
    await checkVideoIsStarted(alicePage, "#localVideo");
    // and no other users will be shown
    await expect(alicePage.getByText("bob")).not.toBeVisible();
    await expect(alicePage.getByText("charlie")).not.toBeVisible();

    // given bob connects to the app
    const bobPage = await openNewPage(browser);
    const bobSettings = {
        name: "bob",
        color: "#ffffff",
    };
    await setUserSettingsAndLaunch(bobSettings, bobPage);
    // then bob configuration loads
    await expect(bobPage.getByText("Type")).toHaveValue("peer");
    // and bob 3d world start
    await expect(bobPage.getByText("Virtual World")).toHaveValue("Started");
    // and bob webcam is shown
    await checkVideoIsStarted(bobPage, "#localVideo");
    // and bob sees alice
    await checkPeerIsVisible(bobPage, aliceSettings);
    // and alice sees bob
    await checkPeerIsVisible(alicePage, bobSettings);

    // given charlie connects to the app
    const charlieTvPage = await openNewPage(browser);
    const charlieTvSettings = {
        name: "charlieTv",
        color: "#ff0000",
    };
    await setUserSettingsAndLaunch(charlieTvSettings, charlieTvPage);
    // then charlie configuration loads
    await expect(charlieTvPage.getByText("Type")).toHaveValue("tv");
    // and charlie 3d world start
    await expect(charlieTvPage.getByText("Virtual World")).toHaveValue(
        "Started"
    );
    // and charlie webcam is shown
    await checkVideoIsStarted(charlieTvPage, "#localVideo");

    // and charlie sees alice
    await checkPeerIsVisible(charlieTvPage, aliceSettings);
    // and charlie sees bob
    await checkPeerIsVisible(charlieTvPage, bobSettings);
    // and bob sees charlie
    await checkPeerIsVisible(bobPage, charlieTvSettings);
    // and alice sees charlie
    await checkPeerIsVisible(alicePage, charlieTvSettings);

    // when alice change position
    const alicePosition = newPosition();
    await alicePage.getByText(/^Position$/).fill(JSON.stringify(alicePosition));
    await alicePage.getByText(/^Send position$/).click();
    // then bob receives the new position
    await checkPeerPosition(bobPage, "alice", alicePosition);
    // then charlie receives the new position
    await checkPeerPosition(charlieTvPage, "alice", alicePosition);

    // when alice change the position again
    const aliceNewPosition = newPosition();
    await alicePage
        .getByText(/^Position$/)
        .fill(JSON.stringify(aliceNewPosition));
    await alicePage.getByText(/^Send position$/).click();
    // then bob receives the new position
    await checkPeerPosition(bobPage, "alice", aliceNewPosition);
    // then charlie receives the new position
    await checkPeerPosition(charlieTvPage, "alice", aliceNewPosition);

    // when bob change position
    const bobPosition = newPosition();
    await bobPage.getByText(/^Position$/).fill(JSON.stringify(bobPosition));
    await bobPage.getByText(/^Send position$/).click();
    // then alice receives the new position
    await checkPeerPosition(alicePage, "bob", bobPosition);
    // then charlie receives the new position
    await checkPeerPosition(charlieTvPage, "bob", bobPosition);

    // when charlie change position
    const charliePosition = newPosition();
    await charlieTvPage
        .getByText(/^Position$/)
        .fill(JSON.stringify(charliePosition));
    await charlieTvPage.getByText(/^Send position$/).click();
    // then alice receives the new position
    await checkPeerPosition(alicePage, "charlieTv", charliePosition);
    // then bob receives the new position
    await checkPeerPosition(bobPage, "charlieTv", charliePosition);
});
