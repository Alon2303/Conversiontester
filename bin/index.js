#!/usr/bin/env node

const chalk = require("chalk");
const boxen = require("boxen");
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

const boxenOptions = {
    padding: 0,
    margin: 1,
    borderStyle: "round",
    borderColor: "green",
    backgroundColor: "#555555"
};

const run = chalk.white.bold("Running.. ");
const logFile = chalk.white.bold("Creating log file.. ");
const done = chalk.white.bold("All done");

const runBox = boxen( run, boxenOptions );
const logFileBox = boxen( logFile, boxenOptions );
const doneBox = boxen( done, boxenOptions );
console.log(runBox);


const headers = ['File', 'Size', 'Conversion Time', '\n'].join('\t|\t');
console.log(logFileBox);
fs.writeFile('results.txt', headers, (err)=> {
    if(err){
        console.log(chalk.red.bold("err: ", err));
    }
});

console.log(chalk.yellow.bold('reading directory ' + directoryPath));
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log(chalk.red.bold('Unable to scan directory: ' + err));
    }

fs.mkdir('./temp',(err) => {
    if(err){
        console.log(chalk.red.bold("err: ", JSON.stringify(err)));
    }
});
    //running ffmpeg on all files using forEach
    files.forEach((file, index) => {
        const start = Date.now();
        // Create message per file
        const create = chalk.white.bold("Converting file.. ", index);
        const log = chalk.white.bold("Logging The results for file.. ", index);

        //Box the messages
        const createBox = boxen( create, boxenOptions );
        const logBox = boxen( log, boxenOptions );

        const child = child_process.exec(`ffmpeg -stats -i ${directoryPath}\\${file} -max_muxing_queue_size 9999 output${index}.mp4`, (err, stdout, stderr) => {
            console.log(chalk.yellow.bold("Processing file.. " + index));
            if (err) {
                console.log(chalk.red.bold("err: ",err));
                return;
            }
            console.log(createBox);
        });
        child.on('close', () => {
            const time = Date.now() - start;
            const stats = fs.statSync(`${directoryPath}\\${file}`);
            const fileSizeInBytes = stats.size;
            const truncatedNumber = Math.floor((fileSizeInBytes*0.000001)*100) /100;
            const rowData = [path.extname(file),  truncatedNumber, time+'sec', '\n'].join('\t|\t');
            console.log(logBox);
            fs.appendFile('results.txt', rowData, (err) =>{
                if(err){
                    console.log(chalk.red.bold("err: ", err));
                }
            });
            console.log(doneBox);
            console.log('Process closed');
        });
    });
});


