# Container Image Artifact Download

Github action for downloading a container image artifact. It downloads image artifact uploaded by [container-image-artifact-upload](https://github.com/ishworkh/container-image-artifact-upload) and loads into local container engine for use in a job.

It supports downloading image artifacts from
- same job
- different job in the same workflow
- different job in a different workflow in the same repository
- different job in a different workflow in a different repository

## Inputs

### `image`

**Required** Image name that is to be downloaded.

### `container_engine`

**Optional** Container engine to use load downloaded image into. Supports `docker`, `podman`. Defaults to `docker`.

### `repository`

**Optional** Repository in form of owner/name to download image from.

### `workflow`

**Optional** Workflow name to download image from.

### `token`

**Optional** Token with enough permissions to download artifact(s) from repo and workflow. It is required if `workflow` is set to different workflow than the currently running.

### `workflow_run_id`

**Optional** Filter workflow runs based workflow event. This takes the precedence over all filters if it is set.

### `workflow_conclusion`

**Optional** Filter workflow runs based on workflow conclusion. Possible values are `success`, `failure`, `cancelled`, or `skipped`.

### `commit_sha`

**Optional** Filter workflow runs based on commit SHA.

### `branch`

**Optional** Filter workflow runs based on branch.

### `workflow_event`

**Optional** Filter workflow runs based workflow event.

### `download_tmp_dir`

**Optional** Temporary directory to download assets (default to OS temp dir). Eg. `${{ runner.temp }}`.

## Outputs

### `download_path`

Path in node where container image archive is downloaded. Eg. `/tmp/foo_latest` for image `foo:latest`.

## Example usage

### From a different job in the same workflow

```
...
jobs:
  download_image:
    - name: Checkout project
      uses: actions/checkout@v2

    - name: Download image
      uses: ishworkh/container-image-artifact-download@v2.0.0
      with:
        image: "test_image:latest"

```

```
...
jobs:
  download_image:
    - name: Checkout project
      uses: actions/checkout@v2

    - name: Download image
      uses: ishworkh/container-image-artifact-download@v2.0.0
      with:
        image: "test_image:latest"
        container_engine: "podman"

```

### From a different workflow in the same repository

```
...
jobs:
  download_image:
    - name: Checkout project
      uses: actions/checkout@v2

    - name: Download image
      uses: ishworkh/container-image-artifact-download@v2.0.0
      with:
        image: "test_image:latest"
        workflow: "Some Another Workflow"
        token: "secrettoken"
```

### From a different workflow with run id

```
...
jobs:
  download_image:
    - name: Checkout project
      uses: actions/checkout@v2

    - name: Download image
      uses: ishworkh/container-image-artifact-download@v2.0.0
      with:
        image: "test_image:latest"
        workflow: "Some Another Workflow"
        token: "secrettoken"
        workflow_run_id: "234343434234234"
```

### From a different workflow with other filters

```
...
jobs:
  download_image:
    - name: Checkout project
      uses: actions/checkout@v2

    - name: Download image
      uses: ishworkh/container-image-artifact-download@v2.0.0
      with:
        image: "test_image:latest"
        workflow: "Some Another Workflow"
        token: "secrettoken"
        workflow_event: "dispatch_workflow"
        branch: "main"
        commit_sha: "8471d40bfc4d0abc8409ba9391bb592bd0f1deb4"
        workflow_conclusion: "success"
```

### From a different workflow in a different repository

```
...
jobs:
  download_image:
    - name: Checkout project
      uses: actions/checkout@v2

    - name: Download image
      uses: ishworkh/container-image-artifact-download@v2.0.0
      with:
        image: "test_image:latest"
        repository: "owner/my-repo"
        workflow: "Some Another Workflow"
        token: "secrettoken"
```

## Changelogs

### `v2.0.0`

- Use v4 of @actions/download-artifact
- Update other dependencies

Migration:
- Compatiable with only >=v2.0.0 for ishworkh/container-image-artifact-upload

### `v1.1.1`

- Fix README

### `v1.1.0`

- Update for nodejs 20

### `v1.0.0`

- First release

## License
This library is under the MIT license.
