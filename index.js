var PizZip = require('pizzip');
var Docxtemplater = require('docxtemplater');

var fs = require('fs');
var path = require('path');

//Load the docx file as a binary
var content = fs
    .readFileSync(path.resolve(__dirname, 'input.docx'), 'binary');

var zip = new PizZip(content);

var doc = new Docxtemplater();
doc.loadZip(zip).setOptions({delimiters:{start:'<',end:'>'}});

//set the templateVariables
doc.setData({
  name:'Tilak',
  subject:'List of ur hotels',
  guests:[{
    name:"Tom",
    room_no:"1801",
    count:2,
    phone:809088898
  },
  {
    name:"Donald",
    room_no:"1802",
    count:3,
    phone:6567566789
  },
  {
    name:"Guffy",
    room_no:"1803",
    count:1,
    phone:6567566689
  }]
});

try {
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    doc.render()
}
catch (error) {
    // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
    function replaceErrors(key, value) {
        if (value instanceof Error) {
            return Object.getOwnPropertyNames(value).reduce(function(error, key) {
                error[key] = value[key];
                return error;
            }, {});
        }
        return value;
    }
    console.log(JSON.stringify({error: error}, replaceErrors));

    if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors.map(function (error) {
            return error.properties.explanation;
        }).join("\n");
        console.log('errorMessages', errorMessages);
        // errorMessages is a humanly readable message looking like this :
        // 'The tag beginning with "foobar" is unopened'
    }
    throw error;
}

var buf = doc.getZip()
             .generate({type: 'nodebuffer'});

// buf is a nodejs buffer, you can either write it to a file or do anything else with it.
fs.writeFileSync(path.resolve(__dirname, 'output.docx'), buf);