/**
 * Prepare path for versioned files
 * @param outputPath
 */
export default outputPath => outputPath
    // Add leading slash if missing
    .replace(/^\/?/, '/')
    // insert build folder before js output
    .replace(
        new RegExp(Elixir.config.js.outputFolder),
        `${Elixir.config.versioning.buildFolder}/${Elixir.config.js.outputFolder}`
    );
