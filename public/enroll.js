	
	let inputSize = 512
	let scoreThreshold = 0.5

	let objExpressionDescriptors = {}
	const available_expressions = ['neutral', 'angry', 'happy', 'surprised']

	function getCurrentFaceDetectionNet() {
	    return faceapi.nets.tinyFaceDetector
	}

	function isFaceDetectionModelLoaded() {
	  return !!getCurrentFaceDetectionNet().params
	}

	function getFaceDetectorOptions() {
	  return new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
	}
	
	function hasAllExpressions() {
		return available_expressions.every(function(expression) {
			return objExpressionDescriptors.hasOwnProperty(expression)
		})
    }

    document.addEventListener('expression_added', (e) => {
      
		$('#emotion-'+ e.detail).addClass('fulfilled')

		if (hasAllExpressions()) 
			document.dispatchEvent(new CustomEvent('expressions_fulfilled', {detail: Object.values(objExpressionDescriptors)}))
    })

    document.addEventListener('expressions_fulfilled', (e) => {

      (async () => {

      	const { value: username } = await Swal.fire({
    		  input: 'text',
    		  inputPlaceholder: 'Enter your name',
    		  allowOutsideClick: false,
    		  inputValidator: (value) => {
    		    if (!value) {
    		      return 'You need to write something!'
    		    }
    		  }
    		})

  		addNewUser(username, e.detail)

  		Swal.fire({
  			icon: 'success',
  			text: username +' is enrolled!'
  		})

  		location.href='/'

  		})()
    })

    function addNewUser(label, descriptors) {
    	db.get('enrollment').push({label, descriptors}).write()
    }

    async function onPlay() {
      const videoEl = $('#inputVideo').get(0)

      if(videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
        return setTimeout(() => onPlay())


      const options = getFaceDetectorOptions()

      const result = await faceapi.detectSingleFace(videoEl, options)
        .withFaceLandmarks().withFaceExpressions().withFaceDescriptor()

      const canvas = $('#overlay').get(0)

      if (result) {
        const dims = faceapi.matchDimensions(canvas, videoEl, true)

        const resizedResult = faceapi.resizeResults(result, dims)
        const minConfidence = 0.8

        Object.keys(resizedResult.expressions).forEach( key => {
        	// skip if other expresssions
         	if (available_expressions.indexOf(key) < 0) return
        	
         	if (resizedResult.expressions[key] > minConfidence)
         		// check if face expression not fulfilled yet 
            	if (!objExpressionDescriptors.hasOwnProperty(key)) {
            		// update fullfilled face expressions
            		objExpressionDescriptors[key] = resizedResult.descriptor
            		// trigger event each new expression detected
            		document.dispatchEvent(new CustomEvent('expression_added', {detail: key}))
            	}
        })
        // default label
        const label = 'new user'
        const options = { label }
        const drawBox = new faceapi.draw.DrawBox(resizedResult.detection.box, options)
        drawBox.draw(canvas)
      } else {
        // clear drawings when no detection
        const context = canvas.getContext('2d')

        context.clearRect(0, 0, canvas.width, canvas.height)
      }

      setTimeout(() => onPlay())
    }

    async function run() {
      // load face detection and face expression recognition models
      if (!isFaceDetectionModelLoaded()) {
        await getCurrentFaceDetectionNet().load('/')
      }
      await faceapi.loadFaceExpressionModel('/')
      await faceapi.loadFaceLandmarkModel('/')
      await faceapi.loadFaceRecognitionModel('/')

      // try to access users webcam and stream the images
      // to the video element
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
      const videoEl = $('#inputVideo').get(0)
      videoEl.srcObject = stream
    }

    $(document).ready(function() {
      run()
    })