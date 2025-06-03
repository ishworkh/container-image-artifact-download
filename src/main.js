const { getDownloader, createArtifactDownloader, createOctokitArtifactDownloader } = require('container-image-artifact');

const { getInput, writeOutput, debug, fail } = require('./actions_io');
const { getRepositoryName, getWorkflowName } = require('./actions_context');
const { createFilterBuilder } = require('./workflow_run_filter');

const INPUT_IMAGE = 'image';
const INPUT_CONTAINER_ENGINE = "container_engine";

const INPUT_REPOSITORY = 'repository';
const INPUT_WORKFLOW = 'workflow';
const INPUT_TOKEN = 'token';

// Optional Filters
const INPUT_WORKFLOW_CONCLUSION = "workflow_conclusion";
const INPUT_COMMIT_SHA = "commit_sha";
const INPUT_BRANCH = "branch";
const INPUT_DOWNLOAD_TMP_DIR = "download_tmp_dir";
const INPUT_WORKFLOW_EVENT = "workflow_event";
const INPUT_WORKFLOW_RUN_ID = "workflow_run_id";

const OUTPUT_DOWNLOAD_PATH = 'download_path';

const createWorkflowRunFilter = () => {
    const filterBuilder = createFilterBuilder();

    const workflowRunId = getInput(INPUT_WORKFLOW_RUN_ID);
    if (workflowRunId != "") {
        debug(`Exact run ID ${workflowRunId} wast set. Taking precedence over other filters.`);
        return filterBuilder
            .setWorkflowRunId(workflowRunId)
            .build();
    }

    const commitSHA = getInput(INPUT_COMMIT_SHA);
    if (commitSHA != "") {
        debug(`Commit SHA filter set - ${commitSHA} .`);
        filterBuilder.setCommitSHA(commitSHA);
    }

    const branch = getInput(INPUT_BRANCH);
    if (branch != "") {
        debug(`Branch filter set - ${branch} .`);
        filterBuilder.setBranch(branch);
    }

    const workflowEvent = getInput(INPUT_WORKFLOW_EVENT);
    if (workflowEvent != "") {
        debug(`Workflow event filter set - ${workflowEvent} .`);
        filterBuilder.setWorkflowEvent(workflowEvent);
    }

    const conclusion = getInput(INPUT_WORKFLOW_CONCLUSION);
    if (conclusion != "") {
        debug(`Workflow conclusion filter set to - ${conclusion}`);
        filterBuilder.setWorkflowConclusion(conclusion);
    }

    return filterBuilder.build();
}

async function runAction() {
    const imageName = getInput(INPUT_IMAGE, true);
    const containerEngineName = getInput(INPUT_CONTAINER_ENGINE);
    debug(`Using ${containerEngineName}`);

    const repository = getInput(INPUT_REPOSITORY) || getRepositoryName();
    const workflow = getInput(INPUT_WORKFLOW) || getWorkflowName();
    const dir = getInput(INPUT_DOWNLOAD_TMP_DIR) || undefined;

    debug(`Starting to download image ${imageName} to ${dir}`);
    if (getRepositoryName() == repository && getWorkflowName() == workflow) {
        debug(`Downloading image artifact from the same workflow. `)
        const download = getDownloader(createArtifactDownloader(), containerEngineName);
        const downloadPath = await download(imageName, dir);

        writeOutput(OUTPUT_DOWNLOAD_PATH, downloadPath);
        return;
    }

    debug(`Downloading image artifact from a different workflow ${workflow} in ${repository}. `);
    const token = getInput(INPUT_TOKEN);
    if (token == "") {
        throw new Error(`Input variable: token should be provided for downloading image from another workflow`);
    }

    const [owner, repo] = repository.split("/");
    if (owner == undefined || repo == undefined) {
        throw new Error(`Invalid repository name. Should be in format of owner/repo`);
    }

    debug(`Downloading image from the repo - ${repository}, workflow - ${workflow}. `)
    const download = getDownloader(createOctokitArtifactDownloader(
        token, owner, repo, workflow,
        createWorkflowRunFilter()
    ), containerEngineName)
    const downloadPath = await download(imageName, dir);
    writeOutput(OUTPUT_DOWNLOAD_PATH, downloadPath);
}

runAction()
    .then(() => console.log("Download finished"))
    .catch((err) => fail(err));


