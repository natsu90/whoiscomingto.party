	
	let inputSize = 512
	let scoreThreshold = 0.5

  let labeledDescriptors = null
  let faceMatcher = null

	function getCurrentFaceDetectionNet() {
	    return faceapi.nets.tinyFaceDetector
	}

	function isFaceDetectionModelLoaded() {
	  return !!getCurrentFaceDetectionNet().params
	}

	function getFaceDetectorOptions() {
	  return new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
	}
	
	function hasEnrollmentData() {
      return db.get('enrollment').value().length > 0
    } 

    function clearAttendance() {
    	db.set('attendance', []).write()
    }

    function clearUsers() {
      db.set('enrollment', []).write()
      location.href = '/'
    }

    function enrollUser() {
      Swal.fire({
        title: 'Enroll New Face',
        text: "Please be ready in front of camera. You would need to make some face expressions to enroll. Do not worry, we do not save your data anywhere other than your browser storage.",
        icon: 'info',
        showCancelButton: true,
        // confirmButtonColor: '#3085d6',
        // cancelButtonColor: '#d33',
        confirmButtonText: "I am Ready"
      }).then((result) => {
        if (result.value) {
          location.href = '/enroll'
        }
      })
    }

    if (hasEnrollmentData()) {

    	// somehow 'descriptors' property is converted to object after saved to lowdb
    	// e.g {0: 10, 1: 20, 2: 30} instead of [10, 20, 30]
		labeledDescriptors = db.get('enrollment').value().map(function(ld) { return {label: ld.label, descriptors: ld.descriptors.map(function(d) { return Object.values(d) } )} })

		faceMatcher = faceapi.FaceMatcher.fromJSON({
			distanceThreshold: 0.6, // not sure what is this for
			labeledDescriptors: labeledDescriptors
		})

    }

    document.addEventListener('attendance_detected', (e) => {

      if (db.get('attendance').filter({name: e.detail}).value().length == 0) {

        const name = e.detail
        const time = Date.now()

        new PNotify({
        	type: 'success',
        	text: name + ' is here!'
        })

        db.get('attendance').push({name, time}).write()
      }
    })

    async function onPlay() {
      const videoEl = $('#inputVideo').get(0)

      if(videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
        return setTimeout(() => onPlay())

      const options = getFaceDetectorOptions()

      const results = await faceapi.detectAllFaces(videoEl, options).withFaceLandmarks()
        .withFaceDescriptors()

      const canvas = $('#overlay').get(0)

      if (results) {

        const dims = faceapi.matchDimensions(canvas, videoEl, true)

        const resizedResults = faceapi.resizeResults(results, dims)

        resizedResults.forEach(({ detection, descriptor }) => {

          let label = 'unknown'
          let boxColor = 'red'

          if (faceMatcher !== null) {
            label = faceMatcher.findBestMatch(descriptor).label
            if (label !== 'unknown') {
              boxColor = 'green'
              document.dispatchEvent(new CustomEvent('attendance_detected', {detail: label}))
            }
          }

          // draw detection box
          const options = { label, boxColor }
          const drawBox = new faceapi.draw.DrawBox(detection.box, options)
          drawBox.draw(canvas)
        })

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