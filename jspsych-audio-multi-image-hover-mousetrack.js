/*
 * jsPsych-audio-multi-image-hover-mousetrack
 * Erika Exton

 * plugin for tracking mouse movements while displaying multiple images (with hover actions) on the screen and playing audio
 */

jsPsych.plugins["audio-multi-image-hover-mousetrack"] = (function() {

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('audio-multi-image-hover-mousetrack', 'stimulus', 'audio');
    jsPsych.pluginAPI.registerPreload('audio-multi-image-hover-mousetrack', 'image1', 'image');
    jsPsych.pluginAPI.registerPreload('audio-multi-image-hover-mousetrack', 'image2', 'image');
    jsPsych.pluginAPI.registerPreload('audio-multi-image-hover-mousetrack', 'image3', 'image');
  
    plugin.info = {
      name: 'audio-multi-image-hover-mousetrack',
      parameters: {
        stimulus: {
          type: jsPsych.plugins.parameterType.AUDIO,
          pretty_name: 'Audio stimulus',
          default: undefined,
          description: "the audio to be played"
        },
        image1: {
            type: jsPsych.plugins.parameterType.IMAGE,
            pretty_name: 'main image',
            default: undefined,
            description: "the main image"
        },
        image1_height: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Image height',
            default: null,
            description: 'Set the main image height in pixels'
        },
        image1_width: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Image width',
            default: null,
            description: 'Set the main image width in pixels'
        },
        image2: {
          type: jsPsych.plugins.parameterType.IMAGE,
          pretty_name: 'second image',
          default: undefined,
          description: "the second image"
        },
        image2_height: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'image 2 height',
          default: null,
          description: 'set the second image height in pixels'
        },
        image2_width: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'image 2 width',
          default: null,
          description: 'set the second image width in pixels'
        },
        image3: {
          type: jsPsych.plugins.parameterType.IMAGE,
          pretty_name: 'third image',
          default: undefined,
          description: "the third image"
        },
        image3_height: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'image 3 height',
          default: null,
          description: 'set the third image height in pixels'
        },
        image3_width: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'image 3 width',
          default: null,
          description: 'set the third image width in pixels'
        },
        prompt: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: "prompt",
            default: undefined,
            description: "prompt displayed for participants"
        },
        trial_duration: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: "trial duration",
            default: null,
            description: "duration of trial"
        },
        mousetrack: {
            type: jsPsych.plugins.parameterType.BOOL,
            default: false,
            description: "track mouse location relative to background image",
        },
        show_background_only_when_hovered: {
            type: jsPsych.plugins.parameterType.BOOL,
            default: true,
            description: "the background image is only displayed when the mouse is over it",
        },
        show_img2_only_when_hovered: {
          type: jsPsych.plugins.parameterType.BOOL,
          default: true,
          description: "image 2 is only displayed when the mouse is over it",
        },
        show_img3_only_when_hovered: {
          type: jsPsych.plugins.parameterType.BOOL,
          default: true,
          description: "image 3 is only displayed when the mouse is over it",
        },
        trial_ends_after_audio: {
            type: jsPsych.plugins.parameterType.BOOL,
            default: false,
            description: "does the trial end when the audio file finishes"
        }
      }
    }
  
    plugin.trial = function(display_element, trial) {
  

    // setup audio stimulus
    var context = jsPsych.pluginAPI.audioContext();
    var audio;

    // store response
    var response = {
      startTime: [],
      endTime: [],
      img1coords: [],
      img2coords: [],
      img3coords: [],
      coords1: [],
      coords2: [],
      movement1: [],
      movement2: [],
      img1_movelog1: [],
      img1_movelog2: [],
      img2_movelog1: [],
      img2_movelog2: [],
      img3_movelog1: [],
      img3_movelog2: []
    }

    // record webaudio context start time
    var start_time
    var startTime

    // load audio file

    jsPsych.pluginAPI.getAudioBuffer(trial.stimulus)
      .then(function(buffer){
        if(context !== null){
          audio = context.createBufferSource();
          audio.buffer = buffer;
          audio.connect(context.destination);
        } else {
          audio = buffer;
          audio.currentTime = 0;
        }
        setupTrial();
      })
      .catch(function(err){
        console.error('Failed to load audio file "${trial.stimulus}". Try checking the file path. We recommend using the preload plugin to load audio files.')
        console.error(err)
      });


    function setupTrial() {

    // set up end event if trial needs it

    if(trial.trial_ends_after_audio){
      if(context !== null){
        audio.onended = function() {
          end_trial();
        }
      } else {
        audio.addEventListener('ended', end_trial);
      }
    }

    // end trial if time limit is set
        if (trial.trial_duration !== null) {
          jsPsych.pluginAPI.setTimeout(function() {
            end_trial();
          }, trial.trial_duration);
        }
      
        // set up empty container

        var html = "";

        html += '<div '+
        'id="jspsych-audio-multi-image-hover-mousetrack-img-container" '+
        'class="jspsych-audio-multi-image-hover-mousetrack-img-container" '+
        'style="position: relative; width:'+trial.image1_width+'px; height:'+trial.image1_height+'px; border:2px solid #444; z-index: 0"'+
        '></div>';
        
        // add prompt if there is one
        if (trial.prompt !== null){
          html += trial.prompt;
        }

    // render empty container
    display_element.innerHTML = html;

    //add background image
    display_element.querySelector("#jspsych-audio-multi-image-hover-mousetrack-img-container").innerHTML += '<img '+
    'id="jspsych-audio-multi-image-hover-mousetrack-bkgd-img" '+
    'src="'+trial.image1+'" '+
    'data-src="'+trial.image1+'" '+
    'style="position: absolute; visibility: hidden; width:'+trial.image1_width+'px; height:'+trial.image1_height+'px; top:0px; left:0px; z-index: 1">'+
    '</img>';


    // add adtl div 1
    display_element.querySelector("#jspsych-audio-multi-image-hover-mousetrack-img-container").innerHTML += '<div '+
    'id="jspsych-audio-multi-image-hover-mousetrack-adlt1-img-container" '+
    'style="position: absolute; width: '+trial.image2_width+'px; height: '+trial.image2_height+'px; top:0px; left:0px; z-index: 2">'+
    '</div>';

    //add adlt img 1
    display_element.querySelector("#jspsych-audio-multi-image-hover-mousetrack-adlt1-img-container").innerHTML += '<img '+
    'id="jspsych-audio-multi-image-hover-mousetrack-adlt1-img" '+
    'src="'+trial.image2+'" '+
    'data-src="'+trial.image2+'" '+
    'style="position: absolute; visibility: hidden; width: '+trial.image2_width+'px; height: '+trial.image2_height+'px; top:0px; left:0px; z-index: 3">'+
    '</img>';

    // add adtl div 2
    display_element.querySelector("#jspsych-audio-multi-image-hover-mousetrack-img-container").innerHTML += '<div '+
    'id="jspsych-audio-multi-image-hover-mousetrack-adlt2-img-container" '+
    'style="position: absolute; width: '+trial.image3_width+'px; height: '+trial.image3_height+'px; top:0px; left: '+(trial.image1_width)/2+'px; z-index: 2">'+
    '</div>';

    // add adtl image 2
    display_element.querySelector("#jspsych-audio-multi-image-hover-mousetrack-adlt2-img-container").innerHTML += '<img '+
    'id="jspsych-audio-multi-image-hover-mousetrack-adlt2-img" '+
    'src="'+trial.image3+'" '+
    'data-src="'+trial.image3+'" '+
    'style="position: absolute; visibility: hidden; width: '+trial.image3_width+'px; height: '+trial.image3_height+'px; top: 0px; left:0px; z-index: 3">'+
    '</img>';

    // start audio
    if (context !== null) {
      start_time = context.currentTime;
      console.log("start_time: "+start_time);
      startTime = performance.now();
      response.startTime.push([performance.now()]);
      audio.start(start_time);
    } else {
      audio.play();
    }

    //setup images
    var imgcont1 = document.getElementById("jspsych-audio-multi-image-hover-mousetrack-img-container")
    console.log("imgcont1: "+imgcont1)
    var imgcont2 = document.getElementById("jspsych-audio-multi-image-hover-mousetrack-adlt1-img-container")
    console.log("imgcont2: "+imgcont2)
    var imgcont3 = document.getElementById("jspsych-audio-multi-image-hover-mousetrack-adlt2-img-container")
    console.log("imgcont3: "+imgcont3)
    var imgcont1rect = imgcont1.getBoundingClientRect()
    var viewport1XL = imgcont1rect.left
    var viewport1YT = imgcont1rect.top
    var viewport1XR = imgcont1rect.right
    var viewport1YB = imgcont1rect.bottom
    response.img1coords.push([viewport1XL, viewport1XR, viewport1YT, viewport1YB])
    var imgcont2rect = imgcont2.getBoundingClientRect()
    var viewport2XL = imgcont2rect.left
    var viewport2YT = imgcont2rect.top
    var viewport2XR = imgcont2rect.right
    var viewport2YB = imgcont2rect.bottom
    response.img2coords.push([viewport2XL, viewport2XR, viewport2YT, viewport2YB])
    var imgcont3rect = imgcont3.getBoundingClientRect()
    var viewport3XL = imgcont3rect.left
    var viewport3YT = imgcont3rect.top
    var viewport3XR = imgcont3rect.right
    var viewport3YB = imgcont3rect.bottom
    response.img3coords.push([viewport3XL, viewport3XR, viewport3YT, viewport3YB])
    console.log("image 2 coords: [" +viewport1XL+ " , " +viewport1YT+ "]")
    console.log("image 2 coords: [" +viewport2XL+ " , " +viewport2YT+ "]")
    console.log("image 3 coords: [" +viewport3XL+ " , " +viewport3YT+ "]")

    //track mouse location if applicable
    if (trial.mousetrack){
        imgcont1.addEventListener('mousemove',mouseFunc);


        function mouseFunc(e) {
            var x = parseInt(e.clientX - viewport1XL);
            var y = parseInt(e.clientY - viewport1YT);
            var movex = e.movementX
            var movey = e.movementY
            var mouse_time = performance.now();
            var rt = mouse_time - start_time;
            var rt2 = mouse_time - startTime;
            response.coords1.push([x,y,rt]);
            response.coords2.push([x,y,rt2]);
            response.movement1.push([movex,movey,rt]);
            response.movement2.push([movex,movey,rt2])
        }
    };

    // set image visibility for target
    if (trial.show_background_only_when_hovered){
        imgcont1.addEventListener('mouseenter',hoverFunc);


        function hoverFunc(e) {
            document.getElementById('jspsych-audio-multi-image-hover-mousetrack-bkgd-img').style.visibility="visible";
            var time = performance.now();
            var audio_time = time - start_time;
            var audioTime = time - startTime;
            var movement = "enter";
            var image = "bkgd-img";
            response.img1_movelog1.push([image, movement, audio_time]);
            response.img1_movelog2.push([image, movement, audioTime])
        };

        imgcont1.addEventListener('mouseleave',unHoverFunc);

        function unHoverFunc(e) {
            document.getElementById('jspsych-audio-multi-image-hover-mousetrack-bkgd-img').style.visibility="hidden";
            var time = performance.now();
            var audio_time = time - start_time;
            var audioTime = time - startTime;
            var movement = "leave";
            var image = "bkgd-img";
            response.img1_movelog1.push([image, movement, audio_time]);
            response.img1_movelog2.push([image, movement, audioTime])
        };
    } else {
        document.getElementById('jspsych-audio-multi-image-hover-mousetrack-bkgd-img').style.visibility="visible";
    } 

    // set image visibility for adtl1
    if (trial.show_img2_only_when_hovered){
      imgcont2.addEventListener('mouseenter',hoverFunc1);


      function hoverFunc1(e) {
          document.getElementById('jspsych-audio-multi-image-hover-mousetrack-adlt1-img').style.visibility="visible";
          var time = performance.now();
          var audio_time = time - start_time;
          var audioTime = time - startTime;
          var movement = "enter";
          var image = "adtl1-img";
          response.img2_movelog1.push([image, movement, audio_time]);
          response.img2_movelog2.push([image, movement, audioTime])

      };

      imgcont2.addEventListener('mouseleave',unHoverFunc1);

      function unHoverFunc1(e) {
          document.getElementById('jspsych-audio-multi-image-hover-mousetrack-adlt1-img').style.visibility="hidden";
          var time = performance.now();
          var audio_time = time - start_time;
          var audioTime = time - startTime;
          var movement = "leave";
          var image = "adtl1-img";
          response.img2_movelog1.push([image, movement, audio_time]);
          response.img2_movelog2.push([image, movement, audioTime])

      };
  } else {
      document.getElementById('jspsych-audio-multi-image-hover-mousetrack-adlt1-img').style.visibility="visible";
  } 

    // set image visibility for adtl2
    if (trial.show_img3_only_when_hovered){
      imgcont3.addEventListener('mouseenter',hoverFunc2);


      function hoverFunc2(e) {
          document.getElementById('jspsych-audio-multi-image-hover-mousetrack-adlt2-img').style.visibility="visible";
          var time = performance.now();
          var audio_time = time - start_time;
          var audioTime = time - startTime;
          var movement = "enter";
          var image = "adtl2-img";
          response.img3_movelog1.push([image, movement, audio_time]);
          response.img3_movelog2.push([image, movement, audioTime])

      };

      imgcont3.addEventListener('mouseleave',unHoverFunc2);

      function unHoverFunc2(e) {
          document.getElementById('jspsych-audio-multi-image-hover-mousetrack-adlt2-img').style.visibility="hidden";
          var time = performance.now();
          var audio_time = time - start_time;
          var audioTime = time - startTime;
          var movement = "leave";
          var image = "adtl2-img";
          response.img3_movelog1.push([image, movement, audio_time]);
          response.img3_movelog2.push([image, movement, audioTime])

      };
  } else {
      document.getElementById('jspsych-audio-multi-image-hover-mousetrack-adlt2-img').style.visibility="visible";
  } 
}


        
        // data saving


    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // stop the audio file if it is playing
      if(context !== null){
        audio.stop();
      } else {
        audio.pause();
      }
      // remove audio end event listeners if they exist
      audio.removeEventListener('ended', end_trial);


/*       // remove mousetrack eventlistener
        imgcont1.removeEventListener('mousemove', mouseFunc);

    // remove mouse enter/leave eventlisteners
        imgcont1.removeEventListener('mouseenter',hoverFunc);
        imgcont1.removeEventListener('mouseleave',unhoverFunc);
        imgcont2.removeEventListener('mouseenter',hoverFunc1);
        imgcont2.removeEventListener('mouseleave',unhoverFunc1);
        imgcont3.removeEventListener('mouseenter',hoverFunc2);
        imgcont3.removeEventListener('mouseleave',unhoverFunc2); */


      // gather the data to store for the trial
      var trial_data = {
        "audio": trial.stimulus,
        "start time": response.startTime,
        "image1": trial.image1,
        "image2": trial.image2,
        "image3": trial.image3,
        "image 1 coordinates (left, right, top, bottom)": response.img1coords,
        "image 2 coordinates (left, right, top, bottom)": response.img2coords,
        "image 3 coordinates (left, right, top, bottom)": response.img3coords,
        "coords1": response.coords1,
        "movement1": response.movement1,
        "image 1 movement 1": response.img1_movelog1,
        "image 2 movement 1": response.img2_movelog1,
        "image 3 movement 1": response.img3_movelog1,
        "coords2": response.coords2,
        "movement2": response.movement2,
        "image 1 movement 2": response.img1_movelog2,
        "image 2 movement 2": response.img2_movelog2,
        "image 3 movement 2": response.img3_movelog2
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };
  
    };
  
    return plugin;
  })();