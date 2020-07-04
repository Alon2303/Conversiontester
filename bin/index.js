#!/usr/bin/env node

const chalk = require("chalk");
const yargs = require("yargs");
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const options = yargs
    .usage("Usage: -d <dirPath>")
    .option("d", { alias: "dir", describe: "Directory path", type: "string", demandOption: true })
    .argv;

const dirName = options.dir;

const directoryPath = path.join(dirName);

const run = chalk.yellow.bold("Running.. ");
const logFile = chalk.yellow.bold("Creating log file.. ");
const done = chalk.white.bold("All done");
const temp = chalk.yellow.bold('Creating temp folder..');
const tempExist = chalk.yellow.bold('temp folder exist');
const isTempExist = chalk.yellow.bold('Checking if temp folder exist');

console.log(run);

console.log(isTempExist);
if (fs.existsSync('./temp')) {
    return console.log(tempExist);
}

const headers = ['File', 'Size', 'Conversion Time', '\n'].join('\t|\t');

fs.mkdir('./temp',(err) => {
    if(err){
        return console.log(chalk.red.bold("err: ", JSON.stringify(err)));
    }
    console.log(temp);
});

fs.writeFile('./temp/results.txt', headers, (err)=> {
    if(err){
        return console.log(chalk.red.bold("err: ", err));
    }
    console.log(logFile);
});

// console.log(chalk.yellow.bold('reading directory ' + directoryPath));

fs.readdir(directoryPath, function (err, files) {
    let start;
    let time;
    //handling error
    if (err) {
        return console.log(chalk.red.bold('Unable to scan directory: ' + err));
    }

    //running ffmpeg on all files using forEach
    files.forEach((file, index) => {
        // start = 0;
        // Create message per file
        start = Date.now();
        child_process.execSync(`ffmpeg -i ${directoryPath}\\${file} -max_muxing_queue_size 9999 ./temp/output${index}.mp4`, {stdio: "ignore"});
        time =  Math.floor(((Date.now() - start)/1000)*100) / 100;
        const stats = fs.statSync(`${directoryPath}\\${file}`);
        const fileSizeInBytes = stats.size;
        const truncatedNumber = Math.floor((fileSizeInBytes*0.000001)*100) / 100;
        const rowData = [path.extname(file),  truncatedNumber, time+'sec', '\n'].join('\t|\t');
        fs.appendFile('./temp/results.txt', rowData, (err) =>{
            if(err){
                return console.log(chalk.red.bold("err: ", err));
            }
            const log = chalk.yellow.bold("Logging The results for file.. ", index);
            console.log(log);
            console.log(done);
        });
    });
});


