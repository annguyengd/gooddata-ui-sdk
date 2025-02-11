// (C) 2022 GoodData Corporation
/* eslint-disable no-console */
import path from "path";
import { existsSync, writeFileSync } from "fs";

import { toBackstopJson } from "../stories/_infra/storyRepository";

import "./generated.stories";

const targetFile = path.resolve(__dirname, "stories.json");

/**
 * This makes use of the autogenerated stories barrel file to create BackstopJS config.
 * It has to be done in jest because jest provides a way to mock svg and css imports which we do
 * on several places in the SDK and it is hard to mock using plain typescript or ts-node.
 * Alternative would be a full blown webpack setup or something similar.
 */
describe("story-extractor", () => {
    it("dumps stories into a file", () => {
        const fileContents = toBackstopJson();

        writeFileSync(targetFile, fileContents, { encoding: "utf8" });
        expect(existsSync(targetFile)).toBe(true);
    });
});
