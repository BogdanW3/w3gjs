import W3GReplay from "../../../src/";
import path from "path";
import {
  GameDataBlock,
  TimeslotBlock,
} from "../../../src/parsers/GameDataParser";

const Parser = new W3GReplay();
it("parses a reforged replay properly #1", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "reforged1.w3g"));
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6091);
  expect(test.players.length).toBe(2);
});

it("parses a reforged replay properly #2", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "reforged2.w3g"));
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6091);
  expect(test.players.length).toBe(2);
});

it("parses a replay with new reforged metadata successfully", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "reforged2010.w3g"));
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6102);
  expect(test.players.length).toBe(6);
  expect(test.players[0].name).toBe("BEARAND#1604");
});

it("parses a reforged replay of version 1.32, build 6105 successfully", async () => {
  const test = await Parser.parse(
    path.resolve(__dirname, "reforged_release.w3g"),
  );
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6105);
  expect(test.players.length).toBe(2);
  expect(test.players[0].name).toBe("anXieTy#2932");
  expect(test.players[1].name).toBe("IroNSoul#22724");
});

it("parses a replay with hunter2 as privateString between game name and encoded string successfully", async () => {
  const test = await Parser.parse(
    path.resolve(__dirname, "reforged_hunter2_privatestring.w3g"),
  );
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6105);
  expect(test.players.length).toBe(2);
  expect(test.players[0].name).toBe("pischner#2950");
  expect(test.players[1].name).toBe("Wartoni#2638");
});

it("parses a netease 1.32 replay successfully", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "netease_132.nwg"));
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6105);
  expect(test.players.length).toBe(2);
  expect(test.players[0].name).toBe("HurricaneBo");
  expect(test.players[1].name).toBe("SimplyHunteR");
});

it("parse is a promise that resolves with parser output", async () => {
  const Parser = new W3GReplay();
  const timeslotBlocks: TimeslotBlock[] = [];
  let completedAsyncDummyTask = false;
  const metadataCallback = jest.fn();
  Parser.on("basic_replay_information", metadataCallback);
  Parser.on("gamedatablock", (block: GameDataBlock) => {
    if (block.id === 0x1f) {
      timeslotBlocks.push(block);
    }
  });
  setTimeout(() => {
    completedAsyncDummyTask = true;
  }, 0);
  const test = await Parser.parse(path.resolve(__dirname, "netease_132.nwg"));
  expect(timeslotBlocks.length).toBeGreaterThan(50);
  expect(completedAsyncDummyTask).toBe(true);
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6105);
  expect(test.players.length).toBe(2);
  expect(test.players[0].name).toBe("HurricaneBo");
  expect(test.players[1].name).toBe("SimplyHunteR");
  expect(metadataCallback).toHaveBeenCalledTimes(1);
});

it("emits 0x1A player actions", async () => {
  const Parser = new W3GReplay();
  let amountOf0x1AActions = 0;
  Parser.on("gamedatablock", (block: GameDataBlock) => {
    if (block.id === 0x1f) {
      for (const cmdBlock of block.commandBlocks) {
        amountOf0x1AActions += cmdBlock.actions.filter(
          (action) => action.id === 0x1a,
        ).length;
      }
    }
  });
  await Parser.parse(path.resolve(__dirname, "netease_132.nwg"));
  expect(amountOf0x1AActions).toBeGreaterThan(0);
});

it("handles truncated player names in reforged replays", async () => {
  const test = await Parser.parse(
    path.resolve(__dirname, "reforged_truncated_playernames.w3g"),
  );
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6105);
  expect(test.players.length).toBe(2);
  expect(test.players[0].name).toBe("WaN#1734");
  expect(test.players[1].name).toBe("РозовыйПони#228941");
});

it("ignores a player entry in reforged extraPlayerList that misses in playerList", async () => {
  const test = await Parser.parse(
    path.resolve(__dirname, "reforged_metadata_ghostplayer.w3g"),
  );
  expect(test.players).toMatchSnapshot();
});

it("parses single player replay twistedmeadows.w3g", async () => {
  const test = await Parser.parse(
    path.resolve(__dirname, "reforged_metadata_ghostplayer.w3g"),
  );
  expect(test.players).toMatchSnapshot();
});

it("parses 1.32.8 replay with randomhero and randomraces", async () => {
  const test = await Parser.parse(
    path.resolve(__dirname, "replay_randomhero_randomraces.w3g"),
  );
  expect(test.settings.randomHero).toBe(true);
  expect(test.settings.randomRaces).toBe(true);
});

it("parses 1.32.8 replay with fullsharedunitcontrol, teams together and lock teams", async () => {
  const test = await Parser.parse(
    path.resolve(__dirname, "replay_teamstogether.w3g"),
  );
  expect(test.settings.fullSharedUnitControl).toBe(true);
  expect(test.settings.teamsTogether).toBe(true);
  expect(test.settings.fixedTeams).toBe(true);
  expect(test.settings.randomHero).toBe(false);
  expect(test.settings.randomRaces).toBe(false);
});

it("parses 1.32.8 replay with full observers", async () => {
  const test = await Parser.parse(
    path.resolve(__dirname, "replay_fullobs.w3g"),
  );
  expect(test.settings.observerMode).toBe("FULL");
});

it("parses 1.32.8 replay with referee setting", async () => {
  const test = await Parser.parse(
    path.resolve(__dirname, "replay_referee.w3g"),
  );
  expect(test.settings.observerMode).toBe("REFEREES");
});

it("parses 1.32.8 replay with observer on defeat setting", async () => {
  const test = await Parser.parse(
    path.resolve(__dirname, "replay_obs_on_defeat.w3g"),
  );
  expect(test.settings.observerMode).toBe("ON_DEFEAT");
});

it("should parse hotkeys correctly", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "reforged1.w3g"));
  expect(test.players[0].groupHotkeys[1]).toEqual({ assigned: 1, used: 29 });
  expect(test.players[0].groupHotkeys[2]).toEqual({ assigned: 1, used: 60 });
  expect(test.players[1].groupHotkeys[1]).toEqual({ assigned: 21, used: 106 });
  expect(test.players[1].groupHotkeys[2]).toEqual({ assigned: 4, used: 64 });
});

it("should parse a flo w3c hostbot game correctly", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "ced_vs_lyn.w3g"));
  expect(test.players).toMatchSnapshot();
});

it("should return chat mode types correctly", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "ced_vs_lyn.w3g"));
  expect(test.chat).toMatchSnapshot();
});

it("should handle a netease replay with rogue playerId 3 CommandDataBlocks correctly", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "moju_vs_fly.nwg"));
  expect(test.players).toMatchSnapshot();
});

it("should handle a netease replay with rogue playerId 3 CommandDataBlocks correctly #2", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "1582161008.nwg"));
  expect(test.players).toMatchSnapshot();
});

it("should handle a netease replay with rogue playerId 3 CommandDataBlocks correctly #3", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "1582070968.nwg"));
  expect(test.players).toMatchSnapshot();
});

it("should parse kotg as level 6", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "706266088.w3g"));
  expect(test.players[1].heroes[0].level).toBe(6);
});

describe("winner detection", () => {
  it("should set winningTeamId to teamId of winner of game 1640262494.w3g", async () => {
    const test = await Parser.parse(path.resolve(__dirname, "1640262494.w3g"));
    expect(test.winningTeamId).toBe(0);
    expect(
      test.players.find((player) => player.teamid === test.winningTeamId)!.name,
    ).toBe("Happie");
  });

  it("should set winningTeamId to teamId of winner of game 1448202825.w3g", async () => {
    const test = await Parser.parse(path.resolve(__dirname, "1448202825.w3g"));
    expect(test.winningTeamId).toBe(1);
    expect(
      test.players.find((player) => player.teamid === test.winningTeamId)!.name,
    ).toBe("ThundeR#31281");
  });

  it("should set winningTeamId to teamId of winner of game wan_vs_trunks.w3g", async () => {
    const test = await Parser.parse(
      path.resolve(__dirname, "wan_vs_trunks.w3g"),
    );
    expect(test.winningTeamId).toBe(0);
    expect(
      test.players.find((player) => player.teamid === test.winningTeamId)!.name,
    ).toBe("WaN#1734");
  });
  it("should set winningTeamId to teamId of winner of game benjiii_vs_Scars_Concealed_Hill.w3g", async () => {
    const test = await Parser.parse(
      path.resolve(__dirname, "benjiii_vs_Scars_Concealed_Hill.w3g"),
    );
    expect(test.winningTeamId).toBe(1);
    expect(
      test.players.find((player) => player.teamid === test.winningTeamId)!.name,
    ).toBe("benjiii#1588");
  });

  it("should set winningTeamId to teamId of winner of game esl_cup_vs_changer_1.w3g", async () => {
    const test = await Parser.parse(
      path.resolve(__dirname, "esl_cup_vs_changer_1.w3g"),
    );
    expect(test.winningTeamId).toBe(0);
    expect(
      test.players.find((player) => player.teamid === test.winningTeamId)!.name,
    ).toBe("TapioN#2351");
  });

  it("should set winningTeamId to teamId of winner of game buildingwin_anxietyperspective.w3g", async () => {
    const test = await Parser.parse(
      path.resolve(__dirname, "buildingwin_anxietyperspective.w3g"),
    );
    expect(test.winningTeamId).toBe(1);
    expect(
      test.players.find((player) => player.teamid === test.winningTeamId)!.name,
    ).toBe("anXieTy#2932");
  });

  it("should set winningTeamId to teamId of winner of game buildingwin_helpstoneperspective.w3g", async () => {
    const test = await Parser.parse(
      path.resolve(__dirname, "buildingwin_helpstoneperspective.w3g"),
    );
    expect(test.winningTeamId).toBe(1);
    expect(
      test.players.find((player) => player.teamid === test.winningTeamId)!.name,
    ).toBe("anXieTy#2932");
  });
});
