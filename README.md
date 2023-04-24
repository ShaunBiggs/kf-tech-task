# KrakenFlex Back End Test

This project was to create a script written with [typescript](https://www.typescriptlang.org/) to execute the [provided task](task.md) leveraging krakenflexs interview API.

The script produced requires two input environment variables in order to run, the required values of these to run successfully are found in the krakenflax task. The variables and the values needed are also below:

<ul>
<li><b>SITE_ID</b>=norwich-pear-tree</li>
<li><b>FILTER_BEFORE_DATE</b>=2022-01-01T00:00:00.000Z</li>
</ul>

## Getting Started

In order to run this task you need to install a [node](https://nodejs.org/en). The package manager for this project is NPM. Once this is installed you can begin.

#### Installing Dependencies

In order to install the dependencies you can run the npm install command from the root directory of the project in your terminal as follows:

```sh
npm install
```

#### Running the script

Once dependencies have been installed you can now run the script via the command line with the following command, this command includes setting the above mentioned environment variables.

```sh
npm run execute:site-outages:default
```

If you wish to override the dependcies you can do so by following the below command pattern:

```sh
SITE_ID=kingfisher FILTER_BEFORE_DATE=2022-01-01T00:00:00.000Z npm run execute:site-outages
```
