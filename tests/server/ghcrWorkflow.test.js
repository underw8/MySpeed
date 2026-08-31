import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (name) => fs.readFileSync(path.join(ROOT, ".github", "workflows", name), "utf8");

const build = read("build-docker.yml");
const deploy = read("deploy_docker_dev.yml");

describe("the fork's GHCR publisher", () => {
    it("publishes under underw8 instead of the upstream Docker Hub account", () => {
        assert.match(build, /ghcr\.io\/\$\{\{\s*github\.repository_owner\s*\}\}\/myspeed/);
        assert.doesNotMatch(build, /i7gamer\/myspeed/);
    });

    it("uses the workflow token to push packages", () => {
        for (const workflow of [build, deploy])
            assert.match(workflow, /packages:\s*write/);

        assert.match(build, /registry:\s*ghcr\.io/);
        assert.match(build, /username:\s*\$\{\{\s*github\.actor\s*\}\}/);
        assert.match(build, /password:\s*\$\{\{\s*secrets\.GITHUB_TOKEN\s*\}\}/);
        assert.doesNotMatch(build, /DOCKERHUB_/);
    });

    it("defaults the safe release to latest and its immutable version tag", () => {
        assert.match(deploy, /latest/);
        assert.match(deploy, /1\.3\.2-underw8\.1/);
    });
});
