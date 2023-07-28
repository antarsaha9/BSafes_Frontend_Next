const fs = require('fs');
const path = require('path');
const util = require('util');
const { exec } = require('child_process');

function generateSRI(file) {
    return new Promise((resolve, reject) => {
        if(!fs.existsSync(file)) {
            console.log(file + " doesn't exist");
            reject("file doesn't exist");
            return;
        }
    
        var command = 'cat ' + file + ' | openssl dgst -sha384 -binary | openssl base64 -A';
        exec(command, function(err, stdout, stderr) {
            if(err) {
                reject(err);
                return;
            }
            var integrity = "sha384-" + stdout;
            resolve(integrity);
        });
    })	
}

const resourceTable = {};
const htmlFiles = [];

const traverse = async function(dir, result = []) {
    
    // list files in directory and loop through
    let files = fs.readdirSync(dir);
    for (let i=0; i< files.length; i++) {
        let file = files[i];
                // builds full path of file
                const fPath = path.resolve(dir, file);
        
                // prepare stats obj
                const fileStats = { file, path: fPath };
        
                // is the file a directory ? 
                // if yes, traverse it also, if no just add it to the result
                if (fs.statSync(fPath).isDirectory()) {
                    fileStats.type = 'dir';
                    fileStats.files = [];
                    result.push(fileStats);
                    await traverse(fPath, fileStats.files)
                    continue;
                }
                let ext = file.split('.').pop();
                if(( ext === 'js') || (ext === 'css')) {
                    fileStats.type = 'file';
                    let sri;
                    try{
                        sri = await generateSRI(fPath);
                    } catch(err){
                        sri = err ;
                    } 
                    fileStats.path = encodeURI(fPath);
                    fileStats.sri = sri;
                    result.push(fileStats);
                    let resourceKey = fileStats.path.split('BSafes_Frontend_Next/upload')[1];
                    resourceTable[resourceKey] = {resource: resourceKey, integrity:sri};
                } else if( ext === 'html') {
                    htmlFiles.push(fileStats);
                }
                
    }
    return result;
};

function processAFile(file) {
    function processCSS() {
        return new Promise((resolve, reject) => {
            console.log('processCSS: ');
            let newFile = file.path; 
            let content = fs.readFileSync(file.path, 'utf8');
                        
            let blocks = content.split("<link");
            let firstBlock = blocks[0];
            fs.writeFileSync(newFile, firstBlock);
            for(let i=1; i< blocks.length; i++ ) {
                let afterLink = blocks[i].substring(blocks[i].indexOf('/>'));
                let partsByHref = blocks[i].split('href="');
                let beforeHref = partsByHref[0];
                let href = partsByHref[1].split('"')[0];
                let resource = resourceTable[href];
                let sriStr = "";
                if(resource) {
                    sriStr = ` integrity="${resource.integrity}" crossorigin="anonymous"`;
                }
                let afterHref = partsByHref[1].split(href+'"')[1].split('/>')[0];
                let newBlock = `<link${beforeHref}href="${href}"${afterHref}${sriStr}${afterLink}`;
                fs.appendFileSync(newFile, newBlock);
            }

            resolve();

        });
    }
    function processJS() {
        return new Promise((resolve, reject) => {
            console.log('processJS: ');
            let newFile = file.path; 
            let content = fs.readFileSync(file.path, 'utf8');
            
            let blocks = content.split("<script");
            let firstBlock = blocks[0];
            fs.writeFileSync(newFile, firstBlock);
            for(let i=1; i< blocks.length; i++ ) {
                if(blocks[i].includes('__NEXT_DATA__'))
                {
                    let newBlock = `<script${blocks[i]}`;
                    fs.appendFileSync(newFile, newBlock);
                    continue;
                }
                let afterScript = blocks[i].split('</script>').pop();
                let partsBySrc = blocks[i].split('src="');
                let beforeSrc = partsBySrc[0];
                let src = partsBySrc[1].split('"')[0];
                let resource = resourceTable[src];
                let sriStr = "";
                if(resource) {
                    sriStr = ` integrity="${resource.integrity}" crossorigin="anonymous"`;
                }
                let afterSrc = partsBySrc[1].split(src+'"')[1].split('>')[0];
                let newBlock = `<script${beforeSrc}src="${src}"${afterSrc}${sriStr}></script>${afterScript}`;
                fs.appendFileSync(newFile, newBlock);
            }
            resolve();
        });
    }

    return new Promise(async (resolve, reject) => {
        console.log('processAFile: ', file);
        if(file.file === 'logIn.html') {
            console.log('debug index.html');
        }
        try {
            await processJS();
            await processCSS();
            resolve();
        } catch (error) {
            reject(error);
        }
        
    })
}

result = traverse(process.argv[2]).then(async result=>{
    //console.log(util.inspect(result, false, null));
    console.log(resourceTable);
    console.log(htmlFiles);

    for(let i=0; i< htmlFiles.length; i++) {
        console.log("=====================");
        try {
            await processAFile(htmlFiles[i])
        } catch (error) {
            console.log("Error: ", htmlFiles[i])
        }
    }
});
