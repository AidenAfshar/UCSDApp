//--------------------
      // GET USER MEDIA CODE
      //--------------------
          navigator.getUserMedia = ( navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia);

      var video;
      var webcamStream;
      const screenshotImage = document.querySelector('img');
            
      function startWebcam() {
        if (navigator.getUserMedia) {
           navigator.getUserMedia (

              // constraints
              {
                 video: true,
                 audio: false,
                 facingMode: {exact: 'environment'},
              },

              // successCallback
              function(localMediaStream) {
                  video = document.querySelector('video');
                  video.srcObject=localMediaStream;
                  awebcamStream = localMediaStream;
              },

              // errorCallback
              function(err) {
                 console.log("The following error occured: " + err);
              }
           );
        } else {
           console.log("getUserMedia not supported");
        }  
      }
      
      var canvas, ctx;

      function init() {
        canvas = document.getElementById("myCanvas");
        ctx = canvas.getContext('2d');
     }

     
   // parse_tsv(tsvstring, function (row) { do something with row })  
   function parse_tsv(s) {
      var parsedArray = [];
      var ix_end = 0;
      for (var ix=0; ix<s.length; ix=ix_end+1) {
         ix_end = s.indexOf('\n', ix);
         if (ix_end == -1) {
            ix_end = s.length;
         }
         var row = s.substring(ix, ix_end-1).split('\t');
         //f(row);
         parsedArray.push(row);
      }
      return parsedArray;
   }
      
     function snapshot () {
         var fileName = document.getElementById("dataCSV");
         alert(fileName.value);
         var fileContents = readTextFile("file:\\\\\\" + fileName.value);
         alert(fileContents); 
         csvToJSON(fileContents);
         canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height); // Creates duplicate of canvas contents
         var text = canvas.toDataURL('image/png', 1.0); // A text representation of the canvas's image in png format
         
         filename = text.slice(22); // Removes "data:image..." prefix from the dataUrl

         // Post Request
         var b=JSON.stringify({"requests":[{  "image":{    "content":filename    }  ,  "features": [{"type":"TEXT_DETECTION","maxResults":5}]    } ]});
         var e=new XMLHttpRequest; 
         e.onload=function(){
            console.log(e.responseText);
            response = JSON.parse(e.responseText);
            var textAndCoords = {};
            var text = {};
            var vertices;
            //alert(JSON.stringify(response["responses"][0]["textAnnotations"]));

            //for (let f = 0; f < fullText.length)
            //var fullText = String(response["responses"][0]["textAnnotations"][0]["description"]).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '').split("\n"); // Creates a string of the words found in the image
            //alert(fullText);
            //alert(fullText)
            for (let i = 0; i < response["responses"][0]["textAnnotations"].length; i++) {
               vertices = [];
               text["description"] = response["responses"][0]["textAnnotations"][i]["description"].replace('[^A-Za-z0-9]', '');
               

               /*for (index in response["responses"][0]["textAnnotations"][i]["boundingPoly"]["vertices"]) {
                  vertices = (['(' + index["x"] + ',' + index["y"] + ')']);
               }*/
               
               for (index in response["responses"][0]["textAnnotations"][i]["boundingPoly"]["vertices"]) {
                  vertices.push('('+ response["responses"][0]["textAnnotations"][i]["boundingPoly"]["vertices"][index]["x"] + ','+ response["responses"][0]["textAnnotations"][i]["boundingPoly"]["vertices"][index]["y"] + ')');
               }
               textAndCoords[text["description"]] = vertices;

            }

            var coords;

            var originalCoords;
            var prevCoords;
            var wordList = [];

            //alert(Object.keys(textAndCoords));

            var fullText = Object.keys(textAndCoords)[0].split('\n'); // Creates a string of the words found in the image
            //var fullText = String(Object.keys(textAndCoords)).split('[^a-zA-Z0-9]'); // Creates a string of the words found in the image\
            alert(fullText);
         
            for (var i = 1; i < (fullText.length); i++) {
               wordList = fullText[i].split(/[^A-Za-z]/); // Splits each line into a list of words

               ctx.beginPath();
               if (wordList.length == 1) {
                  alert(wordList);
                  if (textAndCoords[wordList] == undefined) {
                     //alert(fullText);
                     //alert(wordList)
                  }
                  for (let j = 0; j < 4; j++) {
                     textAndCoords[wordList][j] = textAndCoords[wordList][j].replace('(', ''); // Gets and reformats coordinates
                     textAndCoords[wordList][j] = textAndCoords[wordList][j].replace(')', '');
                     coords = textAndCoords[wordList][j].split(',');
                     // Drawing vertices/rectangle
                     if (j == 0) {
                        ctx.moveTo(parseInt(coords[0]), parseInt(coords[1]));
                        originalCoords = coords;
                     }
                     else {
                        ctx.lineTo(parseInt(coords[0]), parseInt(coords[1]));
                     }
                  }
                  // Drawing last line to first point
                  ctx.lineTo(parseInt(originalCoords[0]), parseInt(originalCoords[1]));
                  ctx.strokeStyle = "blue";
                  ctx.stroke();
               }
               else {
                  alert(wordList);
                  // For lines with more than 1 word, uses coordinates of first and last word in line
                  for (let b = 0; b < 4; b++) {
                     textAndCoords[wordList[0]][b] = textAndCoords[wordList[0]][b].replace('(', '');
                     textAndCoords[wordList[0]][b] = textAndCoords[wordList[0]][b].replace(')', '');
                     coords = textAndCoords[wordList[0]][b].split(',');
                     if (b == 0) {
                        ctx.moveTo(parseInt(coords[0]), parseInt(coords[1]));
                        originalCoords = coords;
                        prevCoords = coords;
                     }
                     else if ((b == 1) || (b == 2)) {
                        textAndCoords[wordList[(wordList.length-1)]][b] = textAndCoords[wordList[(wordList.length-1)]][b].replace('(', '');
                        textAndCoords[wordList[(wordList.length-1)]][b] = textAndCoords[wordList[(wordList.length-1)]][b].replace(')', '');
                        coords = textAndCoords[wordList[(wordList.length-1)]][b].split(',');
                        ctx.moveTo(parseInt(prevCoords[0]), parseInt(prevCoords[1]));
                        ctx.lineTo(parseInt(coords[0]), parseInt(coords[1]));
                        prevCoords = coords;
                     }
                     else {
                        ctx.moveTo(parseInt(prevCoords[0]), parseInt(prevCoords[1]));
                        ctx.lineTo(parseInt(coords[0]), parseInt(coords[1]));
                        prevCoords = coords;
                        
                     }
                  }
                  ctx.moveTo(parseInt(prevCoords[0]), parseInt(prevCoords[1]));
                  ctx.lineTo(parseInt(originalCoords[0]), parseInt(originalCoords[1]));
                  ctx.strokeStyle = "blue";
                  ctx.stroke();
               }
            }
            
         }
         e.open("POST","https://vision.googleapis.com/v1/images:annotate?key=AIzaSyB8h-avSiOPNDfmR0RJxr52LJoM9c5RIyQ",!0); // Not sure why !0 is used here instead of 1
         e.send(b);
         

         /*$.ajax({
            type: "POST",
            url: "{{ 'my-ajax-test/' }}",
            data: { csrfmiddlewaretoken: '{{ csrf_token }}', text: text },
            success: function callback(response){ // Gives a dictionary of the text in the image and their coordinates
               response = JSON.parse(response); // Parses the returned list into a json object*/
      };