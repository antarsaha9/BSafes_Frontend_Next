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
                let resourceKey = fileStats.path.split('bsafes_frontend/out')[1];
                resourceTable[resourceKey] = {resource: resourceKey, integrity:sri};
    }
    return result;
};

result = traverse(process.argv[2]).then(result=>{
    //console.log(util.inspect(result, false, null));
    console.log(resourceTable);
});
