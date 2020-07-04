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

const run = chalk.white.bold("Running.. ");
const logFile = chalk.yellow.bold("Creating log file.. ");
const done = chalk.white.bold("All done");
const temp = chalk.yellow.bold('Creating temp folder..');
const process = chalk.white.bold('Process closed');

console.log(run);


const headers = ['File', 'Size', 'Conversion Time', '\n'].join('\t|\t');

console.log(temp);
fs.mkdir('./temp',(err) => {
    if(err){
        console.log(chalk.red.bold("err: ", JSON.stringify(err)));
    }
});

console.log(logFile);
fs.writeFile('./temp/results.txt', headers, (err)=> {
    if(err){
        console.log(chalk.red.bold("err: ", err));
    }
});

console.log(chalk.yellow.bold('reading directory ' + directoryPath));

fs.readdir(directoryPath, function (err, files) {
    let start;
    //handling error
    if (err) {
        return console.log(chalk.red.bold('Unable to scan directory: ' + err));
    }

    //running ffmpeg on all files using forEach
    files.forEach((file, index) => {
        // Create message per file
        const create = chalk.yellow.bold("Converting file.. ", index);
        const log = chalk.yellow.bold("Logging The results for file.. ", index);

        const child = child_process.exec(`ffmpeg -stats -i ${directoryPath}\\${file} -max_muxing_queue_size 9999 ./temp/output${index}.mp4`, (err, stdout, stderr) => {
            start = Date.now();
            console.log(chalk.yellow.bold("Processing file.. " + index));
            if (err) {
                console.log(chalk.red.bold("err: ",err));
                return;
            }
            console.log(create);
        });
        child.on('exit', (d)=>{
           console.log(chalk.red('exit'));
        });
        child.on('close', () => {
            console.log(chalk.red('close'));
            const time = Date.now() - start;
            const stats = fs.statSync(`${directoryPath}\\${file}`);
            const fileSizeInBytes = stats.size;
            const truncatedNumber = Math.floor((fileSizeInBytes*0.000001)*100) /100;
            const rowData = [path.extname(file),  truncatedNumber, time+'sec', '\n'].join('\t|\t');
            console.log(log);
            fs.appendFile('./temp/results.txt', rowData, (err) =>{
                if(err){
                    console.log(chalk.red.bold("err: ", err));
                }
            });
            console.log(done);
            console.log(process);
        });
    });
});


